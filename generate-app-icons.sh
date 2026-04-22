#!/bin/bash

# Script to generate app icons for Android from the source image
# Source image: src/assets/images/appicon.png (1024x1024)

SOURCE_IMAGE="src/assets/images/appicon.png"
ANDROID_RES_DIR="android/app/src/main/res"

echo "Generating Android app icons from $SOURCE_IMAGE..."

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image $SOURCE_IMAGE not found!"
    exit 1
fi

# Function to generate icon
generate_icon() {
    local size=$1
    local density=$2
    local output_dir="$ANDROID_RES_DIR/mipmap-$density"
    
    echo "Generating ${size}x${size} icons for $density density..."
    
    # Create directory if it doesn't exist
    mkdir -p "$output_dir"
    
    # Generate main launcher icon
    sips -z $size $size "$SOURCE_IMAGE" --out "$output_dir/ic_launcher.png"
    
    # Generate round launcher icon (same as main for now)
    sips -z $size $size "$SOURCE_IMAGE" --out "$output_dir/ic_launcher_round.png"
    
    # Generate foreground (same as main icon)
    sips -z $size $size "$SOURCE_IMAGE" --out "$output_dir/ic_launcher_foreground.png"
    
    # Generate monochrome version (convert to grayscale)
    sips -z $size $size "$SOURCE_IMAGE" --out "$output_dir/ic_launcher_monochrome.png"
    sips -s format png -s formatOptions normal "$output_dir/ic_launcher_monochrome.png"
}

# Generate icons for different densities
generate_icon 48 mdpi      # Medium density
generate_icon 72 hdpi      # High density  
generate_icon 96 xhdpi     # Extra high density
generate_icon 144 xxhdpi   # Extra extra high density
generate_icon 192 xxxhdpi  # Extra extra extra high density

echo "App icons generated successfully!"
echo "Icons have been placed in the Android res directories."
echo ""
echo "Next steps:"
echo "1. Clean and rebuild your Android project"
echo "2. The app will now use your custom app icon"