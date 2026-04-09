use bevy::prelude::*;
use bevy::math::primitives::{Torus, Sphere, Plane3d};
use std::f32::consts::PI;

// Spawns the main torus in the center
fn spawn_torus(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut materials: ResMut<Assets<StandardMaterial>>) {
    // Create a torus using the Meshable trait
    let torus = meshes.add(
        Torus::new(1.0, 0.4)
            .mesh()
    );
    
    // Create glowing cyan material
    let cyan_material = materials.add(StandardMaterial {
        base_color: Color::srgb(0.0, 1.0, 1.0),
        emissive: LinearRgba::new(0.3, 0.8, 0.8, 1.0),
        metallic: 0.8,
        reflectance: 0.5,
        ..default()
    });
    
    commands.spawn((
        PbrBundle {
            mesh: torus,
            material: cyan_material,
            transform: Transform::from_xyz(0.0, 1.0, 0.0).with_scale(Vec3::splat(1.5)),
            ..default()
        },
        TorusObj,
    ));
}

// Spawn orbiting spheres
fn spawn_orbiting_spheres(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut materials: ResMut<Assets<StandardMaterial>>) {
    // Create sphere mesh
    let sphere = meshes.add(
        Sphere::new(0.3)
            .mesh()
    );
    
    let colors = [
        (1.0, 0.0, 0.5),  // Magenta
        (1.0, 0.8, 0.0),  // Gold
        (0.0, 1.0, 0.5),  // Teal
        (0.5, 0.0, 1.0),  // Purple
    ];
    
    for (i, (r, g, b)) in colors.iter().enumerate() {
        let angle = (i as f32 / 4.0) * 2.0 * PI;
        let radius = 3.0 + (i as f32 * 0.5);
        let speed = 0.5 + (i as f32 * 0.2);
        
        let material = materials.add(StandardMaterial {
            base_color: Color::srgb(*r, *g, *b),
            emissive: LinearRgba::new(r * 0.5, g * 0.5, b * 0.5, 1.0),
            metallic: 0.7,
            ..default()
        });
        
        commands.spawn((
            PbrBundle {
                mesh: sphere.clone(),
                material,
                transform: Transform::from_xyz(
                    angle.cos() * radius,
                    1.0 + (i as f32 * 0.3),
                    angle.sin() * radius,
                ),
                ..default()
            },
            Orbit {
                radius,
                speed,
                angle,
                height_offset: 1.0 + (i as f32 * 0.3),
            },
        ));
    }
}

// Spawn ground plane
fn spawn_ground(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut materials: ResMut<Assets<StandardMaterial>>) {
    // Create plane mesh (Plane3d needs half_size parameter)
    let ground = meshes.add(
        Plane3d::new(Vec3::Y, Vec2::splat(10.0))
            .mesh()
    );
    
    let ground_material = materials.add(StandardMaterial {
        base_color: Color::srgb(0.05, 0.05, 0.08),
        metallic: 0.9,
        reflectance: 0.8,
        ..default()
    });
    
    commands.spawn(PbrBundle {
        mesh: ground,
        material: ground_material,
        transform: Transform::from_xyz(0.0, -0.5, 0.0),
        ..default()
    });
}

// Spawn lights
fn spawn_lights(mut commands: Commands) {
    // Ambient light
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            color: Color::srgb(0.1, 0.1, 0.2),
            intensity: 50.0,
            radius: 20.0,
            ..default()
        },
        transform: Transform::from_xyz(0.0, 5.0, 0.0),
        ..default()
    });
    
    // Main directional light
    commands.spawn(DirectionalLightBundle {
        directional_light: DirectionalLight {
            color: Color::srgb(1.0, 0.95, 0.9),
            illuminance: 1500.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_xyz(5.0, 10.0, 5.0).looking_at(Vec3::ZERO, Vec3::Y),
        ..default()
    });
    
    // Colored accent lights
    let accent_positions = [
        (Vec3::new(4.0, 2.0, 0.0), Color::srgb(0.0, 1.0, 1.0)),    // Cyan
        (Vec3::new(-4.0, 2.0, 0.0), Color::srgb(1.0, 0.0, 1.0)),   // Magenta
        (Vec3::new(0.0, 2.0, 4.0), Color::srgb(1.0, 0.84, 0.0)),  // Gold
    ];
    
    for (pos, color) in accent_positions {
        commands.spawn(PointLightBundle {
            point_light: PointLight {
                color,
                intensity: 100.0,
                radius: 10.0,
                ..default()
            },
            transform: Transform::from_xyz(pos.x, pos.y, pos.z),
            ..default()
        });
    }
}

// Animate torus rotation
fn animate_torus(time: Res<Time>, mut query: Query<&mut Transform, With<TorusObj>>) {
    for mut transform in query.iter_mut() {
        let t = time.elapsed_seconds();
        transform.rotation = Quat::from_rotation_y(t * 0.5) * Quat::from_rotation_z(t * 0.3);
    }
}

// Animate orbiting spheres
fn animate_spheres(time: Res<Time>, mut query: Query<(&Orbit, &mut Transform)>) {
    for (orbit, mut transform) in query.iter_mut() {
        let new_angle = orbit.angle + orbit.speed * time.delta_seconds();
        transform.translation.x = new_angle.cos() * orbit.radius;
        transform.translation.z = new_angle.sin() * orbit.radius;
    }
}

// Animate camera orbit
fn animate_camera(time: Res<Time>, mut query: Query<&mut Transform, With<Camera>>) {
    for mut transform in query.iter_mut() {
        let t = time.elapsed_seconds() * 0.2;
        let radius = 8.0;
        let height = 4.0;
        
        transform.translation.x = t.cos() * radius;
        transform.translation.z = t.sin() * radius;
        transform.translation.y = height + (t.sin() * 0.5);
        
        transform.look_at(Vec3::new(0.0, 1.0, 0.0), Vec3::Y);
    }
}

// Component markers
#[derive(Component)]
struct TorusObj;

#[derive(Component)]
struct Orbit {
    radius: f32,
    speed: f32,
    angle: f32,
    height_offset: f32,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Rust 3D Effect App".into(),
                resolution: (1280., 720.).into(),
                fit_canvas_to_parent: true,
                ..default()
            }),
            ..default()
        }))
        .add_systems(Startup, (
            spawn_torus,
            spawn_orbiting_spheres,
            spawn_ground,
            spawn_lights,
            spawn_camera,
        ))
        .add_systems(Update, (
            animate_torus,
            animate_spheres,
            animate_camera,
        ))
        .run();
}

fn spawn_camera(mut commands: Commands) {
    commands.spawn(Camera3dBundle {
        transform: Transform::from_xyz(8.0, 4.0, 0.0).looking_at(Vec3::new(0.0, 1.0, 0.0), Vec3::Y),
        ..default()
    });
}
