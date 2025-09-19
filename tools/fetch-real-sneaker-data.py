#!/usr/bin/env python3
"""
Fetch real sneaker data from KicksCrew API and update the database
"""
import http.client
import json
import requests
import time
import csv
from typing import Dict, List, Any

# API Configuration
RAPIDAPI_KEY = "66489bea50mshf22f7fbd7bb44a6p1271a4jsn01d298c98ea9"
RAPIDAPI_HOST = "kickscrew-sneakers-data.p.rapidapi.com"

# Brand mappings for API calls
BRAND_MAPPINGS = {
    'nike': 'nike',
    'jordan': 'jordan', 
    'adidas': 'adidas',
    'new balance': 'new-balance',
    'converse': 'converse',
    'vans': 'vans',
    'asics': 'asics',
    'puma': 'puma',
    'reebok': 'reebok',
    'saucony': 'saucony',
    'hoka': 'hoka',
    'on': 'on-running',
    'brooks': 'brooks',
    'mizuno': 'mizuno'
}

def fetch_sneaker_data(brand: str, page: int = 1, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch sneaker data from KicksCrew API"""
    try:
        conn = http.client.HTTPSConnection(RAPIDAPI_HOST)
        
        url = f"/product/bycollection/v2/filters?collection={brand}&page={page}&limit={limit}"
        
        headers = {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
        
        print(f"🔍 Fetching {brand} sneakers (page {page})...")
        conn.request("GET", url, headers=headers)
        
        res = conn.getresponse()
        data = res.read()
        
        if res.status == 200:
            response_data = json.loads(data.decode("utf-8"))
            products = response_data.get('data', [])
            print(f"✅ Found {len(products)} {brand} products")
            return products
        else:
            print(f"❌ Error fetching {brand}: {res.status} - {data.decode('utf-8')}")
            return []
            
    except Exception as e:
        print(f"❌ Exception fetching {brand}: {e}")
        return []
    finally:
        conn.close()

def process_sneaker_data(products: List[Dict[str, Any]], brand: str) -> List[Dict[str, Any]]:
    """Process and clean sneaker data"""
    processed = []
    
    for product in products:
        try:
            # Extract key information
            processed_product = {
                'name': product.get('name', ''),
                'brand': brand.title(),
                'model': product.get('model', ''),
                'image_url': product.get('image', ''),
                'price': product.get('price', 0),
                'colorway': product.get('colorway', ''),
                'sku': product.get('sku', ''),
                'description': product.get('description', ''),
                'release_date': product.get('release_date', ''),
                'sizes': product.get('sizes', []),
                'colors': product.get('colors', []),
                'category': product.get('category', ''),
                'style_code': product.get('style_code', ''),
                'retail_price': product.get('retail_price', 0),
                'discount': product.get('discount', 0),
                'availability': product.get('availability', 'in_stock'),
                'rating': product.get('rating', 0),
                'reviews_count': product.get('reviews_count', 0)
            }
            
            # Only add if we have essential data
            if processed_product['name'] and processed_product['image_url']:
                processed.append(processed_product)
                
        except Exception as e:
            print(f"⚠️ Error processing product: {e}")
            continue
    
    return processed

def save_to_csv(data: List[Dict[str, Any]], filename: str):
    """Save processed data to CSV"""
    if not data:
        print(f"⚠️ No data to save to {filename}")
        return
        
    fieldnames = [
        'name', 'brand', 'model', 'image_url', 'price', 'colorway', 'sku',
        'description', 'release_date', 'sizes', 'colors', 'category',
        'style_code', 'retail_price', 'discount', 'availability', 'rating', 'reviews_count'
    ]
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"💾 Saved {len(data)} products to {filename}")

def main():
    """Main function to fetch all sneaker data"""
    print("🚀 Starting KicksCrew data fetch...")
    
    all_products = []
    
    # Fetch data for each brand
    for db_brand, api_brand in BRAND_MAPPINGS.items():
        print(f"\n📦 Processing {db_brand}...")
        
        # Try multiple pages for each brand
        for page in range(1, 4):  # Try first 3 pages
            products = fetch_sneaker_data(api_brand, page=page, limit=20)
            
            if not products:
                break
                
            processed = process_sneaker_data(products, db_brand)
            all_products.extend(processed)
            
            # Rate limiting
            time.sleep(1)
            
            # Stop if we have enough products for this brand
            if len(processed) >= 10:
                break
    
    print(f"\n📊 Total products fetched: {len(all_products)}")
    
    # Save to CSV
    output_file = "real_sneaker_data.csv"
    save_to_csv(all_products, output_file)
    
    # Also save a sample for testing
    sample_file = "sample_sneaker_data.csv"
    sample_data = all_products[:20]  # First 20 products
    save_to_csv(sample_data, sample_file)
    
    print(f"\n🎉 Data fetch complete!")
    print(f"📁 Full data: {output_file}")
    print(f"📁 Sample data: {sample_file}")
    
    # Print some examples
    print(f"\n📋 Sample products:")
    for i, product in enumerate(sample_data[:5]):
        print(f"{i+1}. {product['name']} - {product['brand']} - ${product['price']}")

if __name__ == "__main__":
    main()

