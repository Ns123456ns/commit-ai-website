# Commit AI Engineering Onboarding

A comprehensive guide to AWS AI services and pricing for the Commit AI engineering team.

## 🌐 Live Website

**[View the website →](https://ns123456ns.github.io/commit-ai-website/)**

## 📋 Categories

| Category | Services |
|----------|----------|
| **RAG** | AWS Knowledge Base + S3 Vectors |
| **Vision** | Amazon Rekognition |
| **OCR** | Amazon Textract |
| **Voice** | Amazon Nova Sonic, Polly, Transcribe |
| **Storage** | Amazon S3, DynamoDB |
| **Agent Core** | Bedrock AgentCore |
| **LLM Models** | Claude, DeepSeek, Titan Embeddings |

## 🚀 Features

- **Service Recommendations** - Why to use each service with pros/cons
- **Validated Pricing** - All prices verified from AWS documentation
- **Cost Calculators** - Estimate monthly costs for each service
- **Responsive Design** - Works on desktop and mobile

## 🔄 Price Scraper

The `scraper/` folder contains a Crawl4AI script to refresh pricing data:

```bash
pip install crawl4ai
python scraper/fetch_prices.py
```

## 📁 Project Structure

```
├── index.html          # Main website
├── styles.css          # Styling
├── script.js           # Interactivity
├── prices.json         # Pricing data
└── scraper/
    ├── requirements.txt
    └── fetch_prices.py # Price scraper
```

## 🛠️ Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

## 📄 License

MIT

