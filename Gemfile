source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# MR-C substrate build-fix (2026-06-28) — Ruby 3.4.7 compatibility for the iOS
# CocoaPods toolchain (toolchain-compat only; NO native writer logic):
#  1. The RN 0.74 template pinned CocoaPods `< 1.15` (resolves to 1.14.3);
#     CocoaPods 1.16+ is required for Ruby 3.4 (also fixes the 1.15 build bug).
#  2. Ruby 3.4 moved `nkf` (which provides the `kconv` library) out of the default
#     gems. CocoaPods → `xcodeproj` → the `CFPropertyList` gem still `require`s
#     `kconv` when reading an XCFramework Info.plist, so without `nkf` declared
#     `pod install` dies with `cannot load such file -- kconv`. Declaring `nkf`
#     restores it. `activesupport` cap relaxed so bundler can resolve the set.
gem 'cocoapods', '>= 1.16'
gem 'activesupport', '>= 6.1.7.5'
gem 'nkf'
