#!/bin/bash

# Fix App Icon Script - Add padding to prevent zoomed appearance
SOURCE_ICON="src/assets/images/appicon.png"

echo "Fixing app icon by adding safe area padding..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    if ! command -v convert &> /dev/null; then
        echo "ImageMagick is not installed. Installing via Homebrew..."
        if command -v brew &> /dev/null; then
            brew install imagemagick
        else
            echo "Please install ImageMagick manually"
            exit 1
        fi
    fi
fi

# Create a padded version of the icon (add 15% padding on all sides)
echo "Creating padded version of the app icon..."
if command -v magick &> /dev/null; then
    magick "$SOURCE_ICON" -resize 85%x85% -gravity center -extent 1024x1024 -background transparent temp_icon.png
else
    convert "$SOURCE_ICON" -resize 85%x85% -gravity center -extent 1024x1024 -background transparent temp_icon.png
fi

# Replace the original with the padded version
mv temp_icon.png "$SOURCE_ICON"

echo "App icon has been updated with proper padding!"

# Regenerate Android app icons
echo "Regenerating Android app icons..."

# mdpi - 48x48
mkdir -p android/app/src/main/res/mipmap-mdpi
if command -v magick &> /dev/null; then
    magick "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    magick "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
    magick "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
    magick "$SOURCE_ICON" -resize 48x48 -colorspace Gray android/app/src/main/res/mipmap-mdpi/ic_launcher_monochrome.png
else
    convert "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    convert "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
    convert "$SOURCE_ICON" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
    convert "$SOURCE_ICON" -resize 48x48 -colorspace Gray android/app/src/main/res/mipmap-mdpi/ic_launcher_monochrome.png
fi

# hdpi - 72x72
mkdir -p android/app/src/main/res/mipmap-hdpi
if command -v magick &> /dev/null; then
    magick "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    magick "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
    magick "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
    magick "$SOURCE_ICON" -resize 72x72 -colorspace Gray android/app/src/main/res/mipmap-hdpi/ic_launcher_monochrome.png
else
    convert "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    convert "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
    convert "$SOURCE_ICON" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
    convert "$SOURCE_ICON" -resize 72x72 -colorspace Gray android/app/src/main/res/mipmap-hdpi/ic_launcher_monochrome.png
fi

# xhdpi - 96x96
mkdir -p android/app/src/main/res/mipmap-xhdpi
if command -v magick &> /dev/null; then
    magick "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    magick "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
    magick "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
    magick "$SOURCE_ICON" -resize 96x96 -colorspace Gray android/app/src/main/res/mipmap-xhdpi/ic_launcher_monochrome.png
else
    convert "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    convert "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
    convert "$SOURCE_ICON" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
    convert "$SOURCE_ICON" -resize 96x96 -colorspace Gray android/app/src/main/res/mipmap-xhdpi/ic_launcher_monochrome.png
fi

# xxhdpi - 144x144
mkdir -p android/app/src/main/res/mipmap-xxhdpi
if command -v magick &> /dev/null; then
    magick "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    magick "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
    magick "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
    magick "$SOURCE_ICON" -resize 144x144 -colorspace Gray android/app/src/main/res/mipmap-xxhdpi/ic_launcher_monochrome.png
else
    convert "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    convert "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
    convert "$SOURCE_ICON" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
    convert "$SOURCE_ICON" -resize 144x144 -colorspace Gray android/app/src/main/res/mipmap-xxhdpi/ic_launcher_monochrome.png
fi

# xxxhdpi - 192x192
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
if command -v magick &> /dev/null; then
    magick "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    magick "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
    magick "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
    magick "$SOURCE_ICON" -resize 192x192 -colorspace Gray android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_monochrome.png
else
    convert "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    convert "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
    convert "$SOURCE_ICON" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
    convert "$SOURCE_ICON" -resize 192x192 -colorspace Gray android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_monochrome.png
fi

echo ""
echo "✅ App icon has been fixed and regenerated!"
echo ""
echo "The icon now has proper safe area padding (15% on all sides)."
echo "This should prevent the zoomed appearance and make text readable."
echo ""
echo "Next steps:"
echo "1. Clean your project: cd android && ./gradlew clean"
echo "2. Rebuild: cd .. && npx react-native run-android"