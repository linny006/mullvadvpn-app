#[cfg(target_os = "linux")]
#[path = "linux.rs"]
mod imp;

#[cfg(target_os = "linux")]
pub use imp::*;

#[cfg(windows)]
#[path = "windows.rs"]
mod imp;

#[cfg(windows)]
pub use imp::*;
