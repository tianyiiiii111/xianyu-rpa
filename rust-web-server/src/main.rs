use axum::{
    routing::get,
    Router,
};
use std::net::SocketAddr;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    status: String,
    version: String,
}

async fn health() -> axum::Json<HealthResponse> {
    axum::Json(HealthResponse {
        status: "ok".to_string(),
        version: "1.0.0".to_string(),
    })
}

#[derive(Serialize, Deserialize)]
struct InfoResponse {
    name: String,
    rust_version: String,
}

async fn info() -> axum::Json<InfoResponse> {
    axum::Json(InfoResponse {
        name: "Rust Web Server".to_string(),
        rust_version: "1.75".to_string(),
    })
}

#[derive(Serialize, Deserialize, Clone)]
struct Item {
    id: u32,
    name: String,
}

async fn items() -> axum::Json<Vec<Item>>> {
    axum::Json(vec![
        Item { id: 1, name: "Item 1".to_string() },
        Item { id: 2, name: "Item 2".to_string() },
    ])
}

async fn item_by_id(axum::extract::Path(id): axum::extract::Path<u32>) -> axum::Json<Item> {
    axum::Json(Item {
        id,
        name: format!("Item {}", id),
    })
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/info", get(info))
        .route("/api/items", get(items))
        .route("/api/items/:id", get(item_by_id));

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}