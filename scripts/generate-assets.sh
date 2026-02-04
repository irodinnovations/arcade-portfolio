#!/bin/bash
# Generate game assets with DALL-E 3 (transparent backgrounds)

source ~/.config/irod/openai.env

OUTPUT_DIR="/home/moltbot/clawd/arcade-portfolio-v2/public/images/game"
mkdir -p "$OUTPUT_DIR"

# Function to generate image
generate_image() {
  local prompt="$1"
  local filename="$2"
  
  echo "Generating: $filename"
  
  response=$(curl -s https://api.openai.com/v1/images/generations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "{
      \"model\": \"dall-e-3\",
      \"prompt\": \"$prompt\",
      \"n\": 1,
      \"size\": \"1024x1024\",
      \"quality\": \"hd\",
      \"response_format\": \"url\"
    }")
  
  # Extract URL from response
  url=$(echo "$response" | jq -r '.data[0].url')
  
  if [ "$url" != "null" ] && [ -n "$url" ]; then
    curl -s "$url" -o "$OUTPUT_DIR/$filename"
    echo "✓ Saved: $OUTPUT_DIR/$filename"
  else
    echo "✗ Error generating $filename"
    echo "$response" | jq '.error'
  fi
}

# Player Ship - pointing NORTH, thrusters SOUTH
SHIP_PROMPT="Sleek futuristic spaceship viewed from directly above, pointing straight UP (north), triangular/arrow-shaped design. Glowing cyan engine thrusters at the bottom (south) of the ship. Metallic silver and dark gunmetal body with electric cyan accent lights along the edges. Clean geometric military spacecraft aesthetic. No cockpit visible (top-down view). Sharp angular design. Transparent background (alpha channel). Game sprite style, centered, high contrast for visibility against dark backgrounds."

generate_image "$SHIP_PROMPT" "player-ship-new.png"

echo ""
echo "Asset generation complete!"
echo "Check: $OUTPUT_DIR"
