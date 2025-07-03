import csv
import os
import requests
import time

# First, install the required library:
# pip install duckduckgo-search

try:
    from duckduckgo_search import DDGS
except ImportError:
    print("Please install duckduckgo-search first:")
    print("pip install duckduckgo-search")
    exit(1)

# Configuration
CSV_PATH = os.path.join(os.path.dirname(__file__), "imageNames.csv")
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "img", "products")

def get_product_search_term(filename):
    """Convert filename to search term"""
    # Remove file extension
    search_term = filename.replace('.jpg', '').replace('.png', '')
    # Replace hyphens with spaces
    search_term = search_term.replace('-', ' ')
    # Add "product" to get better results
    return f"{search_term} product tech"

def search_product_image(query):
    """Search for product image using DuckDuckGo"""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(
                keywords=query,
                region="wt-wt",
                safesearch="moderate",
                size="medium",
                max_results=1
            ))
            
            if results:
                return results[0]['image']
            return None
            
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return None

def download_image_from_url(image_url, filename):
    """Download image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(image_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Save with the original filename from CSV
        file_path = os.path.join(IMAGES_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(response.content)
        
        return True
        
    except Exception as e:
        print(f"Error downloading image: {e}")
        return False

def download_image(image_filename):
    """Search and download product image"""
    # Ensure the images directory exists
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    filename = image_filename.strip()
    
    # Convert filename to search term
    search_term = get_product_search_term(filename)
    
    print(f"Searching for: {search_term}")
    
    # Search for product image
    image_url = search_product_image(search_term)
    
    if image_url:
        print(f"Found image: {image_url}")
        if download_image_from_url(image_url, filename):
            print(f"✓ Successfully downloaded: {filename}")
            time.sleep(2)  # Be respectful to avoid rate limiting
            return True
        else:
            print(f"✗ Failed to download: {filename}")
            return False
    else:
        print(f"✗ No image found for: {filename}")
        return False

def process_images():
    """Process all images from the CSV file"""
    
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return
    
    # Read all image names from CSV
    image_names = []
    try:
        with open(CSV_PATH, 'r', newline='') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if row:  # Skip empty rows
                    image_names.append(row[0])
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return
    
    if not image_names:
        print("No image names found in CSV file")
        return
    
    print(f"Found {len(image_names)} images to download")
    print(f"Saving to: {IMAGES_DIR}")
    print("Searching for product images...")
    
    # Download images and track failures
    successful_downloads = 0
    failed_downloads = []
    
    for filename in image_names:
        if download_image(filename):
            successful_downloads += 1
        else:
            failed_downloads.append(filename)
    
    # Summary
    print(f"\n--- Download Summary ---")
    print(f"Successful: {successful_downloads}")
    print(f"Failed: {len(failed_downloads)}")
    
    if failed_downloads:
        print(f"Failed downloads: {', '.join(failed_downloads)}")
        
        # Optionally update CSV with only failed downloads
        choice = input("Update CSV with only failed downloads? (y/n): ").lower()
        if choice == 'y':
            try:
                with open(CSV_PATH, 'w', newline='') as csvfile:
                    writer = csv.writer(csvfile)
                    for filename in failed_downloads:
                        writer.writerow([filename])
                print("CSV updated with failed downloads only")
            except Exception as e:
                print(f"Error updating CSV: {e}")
    else:
        print("All images downloaded successfully!")

if __name__ == "__main__":
    process_images()