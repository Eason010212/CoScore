# CoScore: LLM-Empowered Human-AI Collaborative Text Scoring Engine  

CoScore is an innovative platform that combines human expertise with AI-powered automation to streamline text assessment workflows. Our system enables seamless rule generation, scoring execution, and performance analysis for educational assessment applications.  

## ✨ Key Features  

### 📊 Test Data Management  
- **Upload assessment datasets** (labeled or unlabeled) via CSV or direct input  
- Labeled datasets contain answers with human-annotated scores for validation  
- Unlabeled datasets support pure AI scoring applications  
- Centralized storage for easy access across multiple scoring tasks  

### 🤖 Human-AI Collaborative Rule Generation  
- **Input manual scoring criteria** as prompts for LLM-powered rule generation  
- Receive **JSON-formatted structured rules** from our AI engine  
- **Test rules instantly** with sample answers and refine as needed  
- Save perfected rules to your personal library for future tasks  

### ⚡ Task Management & Analytics  
- **Execute scoring tasks** by pairing datasets with scoring rules  
- Queue management system handles concurrent scoring jobs  
- **Visual analytics dashboard** with:  
  - Score distribution charts  
  - Confusion matrix visualization (for labeled data)  
  - Performance metrics  
- **Export detailed results** as CSV for further analysis  

## 🏗️ Project Structure  

```
co-score/
├── app/
│   ├── static/            # Static assets (CSS, JS, images)
│   ├── templates/         # Frontend templates
│   ├── App.py             # Server backend
│   ├── Rule.py            # Scoring engine logic
│   └── ...
├── database.db            # SQLite database
└── ...
```

## 🚀 Getting Started  

```
pip install -r requirements.txt
python app/App.py
```

1. **Prepare your dataset** (CSV format recommended)  
2. **Create scoring rules** using our AI-assisted generator  
3. **Launch scoring tasks** and monitor progress  
4. **Analyze results** through interactive visualizations  

## 📈 Why Choose CoScore?  

- **Precision Control**: Blend AI efficiency with human oversight  
- **Transparent Scoring**: Every decision point documented in generated rules  
- **Scalable Workflows**: Process hundreds of assessments with consistent criteria  
- **Continuous Improvement**: Refine rules based on performance metrics  


💡 **Empower your assessment workflow with human-AI collaboration** - Try CoScore today!  


*Note: This project requires Python 3.8+ and access to an LLM API endpoint.*  