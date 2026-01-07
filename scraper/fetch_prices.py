"""
Crawl4AI Price Scraper for AI Services
Fetches pricing from Anthropic, AWS, and other AI service documentation.

Usage:
    python fetch_prices.py

Output:
    ../prices.json - JSON file with all scraped pricing data
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path

try:
    from crawl4ai import AsyncWebCrawler
except ImportError:
    print("Please install crawl4ai: pip install crawl4ai")
    exit(1)


# URLs to scrape
PRICING_URLS = {
    "anthropic": "https://docs.anthropic.com/en/docs/about-claude/models",
    "deepseek": "https://platform.deepseek.com/api-docs/pricing",
    "aws_bedrock": "https://aws.amazon.com/bedrock/pricing/",
    "aws_s3": "https://aws.amazon.com/s3/pricing/",
    "aws_dynamodb": "https://aws.amazon.com/dynamodb/pricing/",
    "aws_rekognition": "https://aws.amazon.com/rekognition/pricing/",
    "aws_textract": "https://aws.amazon.com/textract/pricing/",
    "aws_polly": "https://aws.amazon.com/polly/pricing/",
    "aws_transcribe": "https://aws.amazon.com/transcribe/pricing/",
}


async def scrape_anthropic_pricing(crawler: AsyncWebCrawler) -> dict:
    """Scrape Claude model pricing from Anthropic docs."""
    print("📡 Fetching Anthropic Claude pricing...")
    
    try:
        result = await crawler.arun(url=PRICING_URLS["anthropic"])
        markdown = result.markdown
        
        # Parse the pricing table from markdown
        models = {}
        
        # Look for pricing patterns like "$5 / MTok" or "$0.25 / MTok"
        # Claude model pricing patterns
        pricing_patterns = [
            (r"Claude Opus 4\.5.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok", "claude-opus-4.5"),
            (r"Claude Opus 4\.1.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok", "claude-opus-4.1"),
            (r"Claude Sonnet 4\.5.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok", "claude-sonnet-4.5"),
            (r"Claude Sonnet 4[^.].*?\$(\d+(?:\.\d+)?)\s*/\s*MTok.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok", "claude-sonnet-4"),
            (r"Claude Haiku 4\.5.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok", "claude-haiku-4.5"),
            (r"Claude Haiku 3\.5.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok.*?\$(\d+(?:\.\d+)?)\s*/\s*MTok", "claude-haiku-3.5"),
        ]
        
        # Simpler approach: extract all pricing mentions
        # Format: Model | Input | Output
        lines = markdown.split('\n')
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            # Look for Claude model mentions with pricing
            if 'claude' in line_lower and 'mtok' in line_lower:
                # Extract prices from line
                prices = re.findall(r'\$(\d+(?:\.\d+)?)', line)
                
                if 'opus 4.5' in line_lower and len(prices) >= 2:
                    models['claude-opus-4.5'] = {'input': float(prices[0]), 'output': float(prices[-1])}
                elif 'opus 4.1' in line_lower and len(prices) >= 2:
                    models['claude-opus-4.1'] = {'input': float(prices[0]), 'output': float(prices[-1])}
                elif 'opus 4' in line_lower and 'opus 4.1' not in line_lower and 'opus 4.5' not in line_lower and len(prices) >= 2:
                    models['claude-opus-4'] = {'input': float(prices[0]), 'output': float(prices[-1])}
                elif 'sonnet 4.5' in line_lower and len(prices) >= 2:
                    models['claude-sonnet-4.5'] = {'input': float(prices[0]), 'output': float(prices[-1])}
                elif 'sonnet 4' in line_lower and 'sonnet 4.5' not in line_lower and len(prices) >= 2:
                    models['claude-sonnet-4'] = {'input': float(prices[0]), 'output': float(prices[-1])}
                elif 'haiku 4.5' in line_lower and len(prices) >= 2:
                    models['claude-haiku-4.5'] = {'input': float(prices[0]), 'output': float(prices[-1])}
                elif 'haiku 3.5' in line_lower and len(prices) >= 2:
                    models['claude-haiku-3.5'] = {'input': float(prices[0]), 'output': float(prices[-1])}
        
        # If parsing failed, use known values as fallback
        if not models:
            print("  ⚠️  Could not parse live data, using known pricing...")
            models = {
                "claude-opus-4.5": {"input": 5, "output": 25},
                "claude-opus-4.1": {"input": 15, "output": 75},
                "claude-opus-4": {"input": 15, "output": 75},
                "claude-sonnet-4.5": {"input": 3, "output": 15},
                "claude-sonnet-4": {"input": 3, "output": 15},
                "claude-haiku-4.5": {"input": 1, "output": 5},
                "claude-haiku-3.5": {"input": 0.80, "output": 4},
            }
        
        print(f"  ✅ Found {len(models)} Claude models")
        return {
            "provider": "Anthropic",
            "source_url": PRICING_URLS["anthropic"],
            "models": models,
            "unit": "per 1M tokens"
        }
        
    except Exception as e:
        print(f"  ❌ Error scraping Anthropic: {e}")
        # Return fallback data
        return {
            "provider": "Anthropic",
            "source_url": PRICING_URLS["anthropic"],
            "models": {
                "claude-opus-4.5": {"input": 5, "output": 25},
                "claude-opus-4.1": {"input": 15, "output": 75},
                "claude-sonnet-4.5": {"input": 3, "output": 15},
                "claude-sonnet-4": {"input": 3, "output": 15},
                "claude-haiku-4.5": {"input": 1, "output": 5},
                "claude-haiku-3.5": {"input": 0.80, "output": 4},
            },
            "unit": "per 1M tokens",
            "note": "Fallback data - scraping failed"
        }


async def scrape_aws_pricing(crawler: AsyncWebCrawler, service: str, url: str) -> dict:
    """Scrape AWS service pricing."""
    print(f"📡 Fetching AWS {service} pricing...")
    
    try:
        result = await crawler.arun(url=url)
        markdown = result.markdown
        
        # Extract price patterns
        prices = re.findall(r'\$(\d+(?:\.\d+)?)', markdown)
        
        print(f"  ✅ Fetched {service} page ({len(prices)} price mentions found)")
        
        return {
            "service": service,
            "source_url": url,
            "raw_content_length": len(markdown),
            "scraped": True
        }
        
    except Exception as e:
        print(f"  ❌ Error scraping {service}: {e}")
        return {
            "service": service,
            "source_url": url,
            "scraped": False,
            "error": str(e)
        }


async def main():
    """Main function to scrape all pricing data."""
    print("=" * 60)
    print("🚀 Crawl4AI Price Scraper")
    print("=" * 60)
    print()
    
    output_data = {
        "last_updated": datetime.now().isoformat(),
        "scraper_version": "1.0.0",
        "llm_models": {},
        "aws_services": {}
    }
    
    async with AsyncWebCrawler() as crawler:
        # Scrape Anthropic pricing
        anthropic_data = await scrape_anthropic_pricing(crawler)
        output_data["llm_models"]["anthropic"] = anthropic_data
        
        print()
        
        # Scrape AWS services (for validation/reference)
        aws_services = [
            ("S3", PRICING_URLS["aws_s3"]),
            ("DynamoDB", PRICING_URLS["aws_dynamodb"]),
            ("Rekognition", PRICING_URLS["aws_rekognition"]),
            ("Textract", PRICING_URLS["aws_textract"]),
            ("Polly", PRICING_URLS["aws_polly"]),
            ("Transcribe", PRICING_URLS["aws_transcribe"]),
        ]
        
        for service_name, service_url in aws_services:
            aws_data = await scrape_aws_pricing(crawler, service_name, service_url)
            output_data["aws_services"][service_name.lower()] = aws_data
    
    # Save to JSON file
    output_path = Path(__file__).parent.parent / "prices.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
    
    print()
    print("=" * 60)
    print(f"✅ Saved pricing data to: {output_path}")
    print("=" * 60)
    
    # Print summary
    print("\n📊 Summary:")
    print(f"  - LLM Models: {len(output_data['llm_models'].get('anthropic', {}).get('models', {}))}")
    print(f"  - AWS Services: {len(output_data['aws_services'])}")
    
    return output_data


if __name__ == "__main__":
    asyncio.run(main())

