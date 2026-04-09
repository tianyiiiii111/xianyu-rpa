//! Rust Web Server - Demonstrating Rust's Unique Features
//! 
//! This server showcases:
//! - Type-safe routing with Rust's type system
//! - Async/await for high-performance concurrency
//! - Zero-cost abstractions
//! - Pattern matching for elegant control flow
//! - RAII for resource management
//! - Macro-powered code generation

use axum::{
    extract::{Path, State},
    http::{HeaderMap, Method, StatusCode},
    response::{Html, Json, IntoResponse},
    routing::{get, post, delete},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, RwLock},
};
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// ============================================================================
// RUST FEATURE 1: Type-Safe State Management with RAII
// ============================================================================

/// Application state with thread-safe data structures
/// Using Arc<RwLock> for shared mutable state without data races
pub struct AppState {
    /// Thread-safe request counter
    request_count: Arc<RwLock<u64>>,
    /// Channel for event broadcasting
    event_tx: broadcast::Sender<String>,
    /// In-memory storage (demonstrating Rust's memory safety)
    items: Arc<RwLock<HashMap<String, Item>>>,
}

impl AppState {
    fn new() -> Self {
        let (event_tx, _) = broadcast::channel(100);
        Self {
            request_count: Arc::new(RwLock::new(0)),
            event_tx,
            items: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

// ============================================================================
// RUST FEATURE 2: Pattern Matching & exhaustive matching
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Item {
    pub id: String,
    pub name: String,
    pub price: f64,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateItemRequest {
    pub name: String,
    pub price: f64,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: u16,
}

/// Result type demonstrating Rust's error handling philosophy
type AppResult<T> = Result<T, AppError>;

/// Custom error type with pattern matching support
#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    InvalidInput(String),
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        // Pattern matching for error handling
        match self {
            AppError::NotFound(msg) => (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse { error: msg, code: 404 }),
            ),
            AppError::InvalidInput(msg) => (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse { error: msg, code: 400 }),
            ),
            AppError::Internal(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse { error: msg, code: 500 }),
            ),
        }
        .into_response()
    }
}

// ============================================================================
// RUST FEATURE 3: Async/Await for efficient concurrency
// ============================================================================

/// Health check endpoint - simple and fast
async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "rust": "🦀",
        "features": ["async", "type-safe", "zero-cost"]
    }))
}

/// Get server info - demonstrating Rust's const generics
async fn server_info(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let count = *state.request_count.read().unwrap();
    
    Json(serde_json::json!({
        "server": "Rust Web Server",
        "version": env!("CARGO_PKG_VERSION"),
        "total_requests": count,
        "rust_features": [
            "ownership",
            "borrowing",
            "lifetimes",
            "traits",
            "generics",
            "macros"
        ]
    }))
}

/// Get all items - using pattern matching on Option
async fn get_items(State(state): State<Arc<AppState>>) -> AppResult<Json<Vec<Item>>> {
    let items = state.items.read().unwrap();
    let items: Vec<Item> = items.values().cloned().collect();
    Ok(Json(items))
}

/// Get single item by ID - demonstrates Result and ? operator
async fn get_item(
    Path(id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<Item>> {
    let items = state.items.read().unwrap();
    
    // Pattern matching with Option
    match items.get(&id) {
        Some(item) => Ok(Json(item.clone())),
        None => Err(AppError::NotFound(format!("Item '{}' not found", id))),
    }
}

/// Create new item - demonstrates Rust's ownership system
async fn create_item(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateItemRequest>,
) -> AppResult<Json<Item>> {
    // Validate input with pattern matching
    if payload.name.is_empty() {
        return Err(AppError::InvalidInput("Name cannot be empty".to_string()));
    }
    if payload.price < 0.0 {
        return Err(AppError::InvalidInput("Price cannot be negative".to_string()));
    }
    
    let id = uuid_v4();
    let item = Item {
        id: id.clone(),
        name: payload.name,
        price: payload.price,
        category: payload.category,
    };
    
    // Acquire write lock, do operation, release automatically (RAII)
    state.items.write().unwrap().insert(id.clone(), item.clone());
    
    // Broadcast event (demonstrates pub/sub pattern)
    let _ = state.event_tx.send(format!("Created item: {}", id));
    
    Ok(Json(item))
}

/// Delete item - demonstrates Option handling
async fn delete_item(
    Path(id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> AppResult<Json<serde_json::Value>> {
    let mut items = state.items.write().unwrap();
    
    // remove returns Option, pattern match on it
    match items.remove(&id) {
        Some(_) => {
            let _ = state.event_tx.send(format!("Deleted item: {}", id));
            Ok(Json(serde_json::json!({"deleted": true, "id": id})))
        }
        None => Err(AppError::NotFound(format!("Item '{}' not found", id))),
    }
}

// ============================================================================
// RUST FEATURE 4: Macro System - Code Generation
// ============================================================================

/// Custom macro demonstration
macro_rules! define_response {
    ($name:ident, $status:expr, $body:expr) => {
        async fn $name() -> impl IntoResponse {
            ($status, Json($body))
        }
    };
}

// Use the macro
define_response!(not_found, StatusCode::NOT_FOUND, 
    serde_json::json!({"error": "Resource not found"}));

// ============================================================================
// RUST FEATURE 5: Traits and Generics
// ============================================================================

/// Trait for serializable responses
trait ToJsonResponse {
    fn to_response(&self) -> Json<serde_json::Value>;
}

impl ToJsonResponse for Item {
    fn to_response(&self) -> Json<serde_json::Value> {
        Json(serde_json::to_value(self).unwrap())
    }
}

// ============================================================================
// RUST FEATURE 6: Advanced Pattern Matching
// ============================================================================

#[derive(Debug)]
enum RequestType {
    Get,
    Post,
    Put(String),
    Delete,
}

// /// Parse method to enum using pattern matching
// fn parse_method(method: &Method) -> RequestType {
//     match method {
//         Method::GET => RequestType::Get,
//         Method::POST => RequestType::Post,
//         Method::PUT => RequestType::Put("default".to_string()),
//         Method::DELETE => RequestType::Delete,
//         _ => RequestType::Get, // Default case
//     }
// }

// ============================================================================
// Helper Functions
// ============================================================================

fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("{:x}", timestamp)
}

// ============================================================================
// Main Entry Point
// ============================================================================

#[tokio::main]
async fn main() {
    // Initialize logging with Rust's tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🚀 Starting Rust Web Server...");
    tracing::info!("🦀 Demonstrating Rust's unique features");

    // Create shared state (Arc for thread-safe sharing)
    let state = Arc::new(AppState::new());

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router with type-safe routes
    let app = Router::new()
        // API Routes
        .route("/api/health", get(health_check))
        .route("/api/info", get(server_info))
        .route("/api/items", get(get_items))
        .route("/api/items", post(create_item))
        .route("/api/items/:id", get(get_item))
        .route("/api/items/:id", delete(delete_item))
        // SSE endpoint for real-time updates
        .route("/api/events", get(event_stream))
        // HTML demo page
        .route("/", get(index_page))
        // Add middleware
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state.clone());

    // Print Rust features being demonstrated
    println!("\n🦀 RUST UNIQUE FEATURES DEMONSTRATED:");
    println!("   ✓ Type-safe routing with compile-time checks");
    println!("   ✓ Async/await for efficient concurrency");
    println!("   ✓ RAII for automatic resource management");
    println!("   ✓ Pattern matching for control flow");
    println!("   ✓ Zero-cost abstractions");
    println!("   ✓ Macros for code generation");
    println!("   ✓ Traits and generics");
    println!("   ✓ Ownership and borrowing\n");

    // Bind to address
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("Server running at http://{}", addr);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// ============================================================================
// Bonus: Server-Sent Events for Real-time
// ============================================================================

async fn event_stream(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "SSE endpoint - use WebSocket for real-time",
        "features": ["Subscribe to events", "Real-time updates"]
    }))
}

// ============================================================================
// Bonus: HTML Demo Page
// ============================================================================

async fn index_page() -> Html<String> {
    Html(r#"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rust Web Server</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            background: #0d1117;
            color: #c9d1d9;
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 900px; margin: 0 auto; }
        h1 {
            color: #58a6ff;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #30363d;
            padding-bottom: 1rem;
        }
        .rust-logo {
            font-size: 4rem;
            text-align: center;
            margin: 2rem 0;
        }
        .feature {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
        }
        .feature h3 { color: #7ee787; margin-bottom: 0.5rem; }
        .feature code {
            background: #0d1117;
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            color: #f0883e;
        }
        .endpoints {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
        }
        .endpoints h3 { color: #a371f7; margin-bottom: 1rem; }
        .endpoint {
            display: flex;
            align-items: center;
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: #0d1117;
            border-radius: 4px;
        }
        .method {
            font-weight: bold;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            margin-right: 1rem;
            min-width: 80px;
            text-align: center;
        }
        .get { background: #238636; color: white; }
        .post { background: #1f6feb; color: white; }
        .delete { background: #da3633; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦀 Rust Web Server</h1>
        <div class="rust-logo">🦀 ⚡ 🚀</div>
        
        <div class="feature">
            <h3>Type Safety</h3>
            <p>Compile-time guarantees prevent runtime errors. The compiler catches bugs before deployment.</p>
            <code>Result&lt;T, AppError&gt; - No null pointers, no undefined behavior</code>
        </div>
        
        <div class="feature">
            <h3>Zero-Cost Abstractions</h3>
            <p>High-level syntax with near-zero runtime overhead. Async/await compiles to efficient state machines.</p>
            <code>async fn - No heap allocation, stack-based coroutines</code>
        </div>
        
        <div class="feature">
            <h3>Memory Safety without GC</h3>
            <p>Ownership system ensures memory safety without garbage collection. No use-after-free, no data races.</p>
            <code>Arc&lt;RwLock&lt;T&gt;&gt; - Thread-safe shared state</code>
        </div>
        
        <div class="feature">
            <h3>Pattern Matching</h3>
            <p>Exhaustive pattern matching ensures all cases are handled. Compiler warns about missing cases.</p>
            <code>match value { Some(x) => ..., None => ... }</code>
        </div>
        
        <div class="endpoints">
            <h3>📡 API Endpoints</h3>
            <div class="endpoint"><span class="method get">GET</span> /api/health - Health check</div>
            <div class="endpoint"><span class="method get">GET</span> /api/info - Server info</div>
            <div class="endpoint"><span class="method get">GET</span> /api/items - List all items</div>
            <div class="endpoint"><span class="method get">GET</span> /api/items/:id - Get item by ID</div>
            <div class="endpoint"><span class="method post">POST</span> /api/items - Create item</div>
            <div class="endpoint"><span class="method delete">DELETE</span> /api/items/:id - Delete item</div>
        </div>
        
        <p style="text-align: center; margin-top: 2rem; color: #8b949e;">
            Built with 🦀 Rust + Axum + Tokio
        </p>
    </div>
</body>
</html>
    "#.to_string())
}
