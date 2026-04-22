#!/bin/bash

# Fix App Icon Script - Add padding to prevent zoomed appearance
# This script creates a version of your app icon with proper safe areas

SOURCE_ICON="src/assets/images/appicon.png"
TEMP_ICON="src/assets/images/appicon_padded.png"

echo "Fixing app icon by adding safe area padding..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "Please install ImageMagick manually:"
        echo "Visit: https://imagemagick.org/script/download.php#macosx"
        exit 1
    fi
fi

# Create a padded version of the icon (add 15% padding on all sides)
echo "Creating padded version of the app icon..."
convert "$SOURCE_ICON" -resize 85%x85% -gravity center -extent 1024x1024 -background transparent "$TEMP_ICON"

# Replace the original with the padded version
mv "$TEMP_ICON" "$SOURCE_ICON"

echo "App icon has been updated with proper padding!"

# Regenerate all Android app icon sizes with the fixed icon
echo "Regenerating Android app icons with the fixed version..."

# Android app icon directories and sizes
declare -A DENSITIES=(
    ["mdpi"]="48"
    ["hdpi"]="72"
    ["xhdpi"]="96"
    ["xxhdpi"]="144"
    ["xxxhdpi"]="192"
)

# Generate icons for each density
for density in "${!DENSITIES[@]}"; do
    size=${DENSITIES[$density]}
    dir="android/app/src/main/res/mipmap-$density"
    
    echo "Generating ${size}x${size} icons for $density density..."
    
    # Create directory if it doesn't exist
    mkdir -p "$dir"
    
    # Generate all required icon variants
    convert "$SOURCE_ICON" -resize ${size}x${size} "$dir/ic_launcher.png"
    convert "$SOURCE_ICON" -resize ${size}x${size} "$dir/ic_launcher_round.png"
    convert "$SOURCE_ICON" -resize ${size}x${size} "$dir/ic_launcher_foreground.png"
    
    # Create monochrome version (convert to grayscale)
    convert "$SOURCE_ICON" -resize ${size}x${size} -colorspace Gray "$dir/ic_launcher_monochrome.png"
done

echo ""
echo "✅ App icon has been fixed and regenerated!"
echo ""
echo "The icon now has proper safe area padding to prevent the zoomed appearance."
echo "Text and other elements should now be clearly visible."
echo ""
echo "Next steps:"
echo "1. Clean your project: cd android && ./gradlew clean"
echo "2. Rebuild: cd .. && npx react-native run-android"