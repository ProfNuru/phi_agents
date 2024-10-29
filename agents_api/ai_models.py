from phi.model.openai import OpenAIChat
from phi.tools.duckduckgo import DuckDuckGo
from phi.tools.yfinance import YFinanceTools

AI_MODELS = {
    "openai-gpt-4o": OpenAIChat(id="gpt-4o")
}

AI_TOOLS  = {
    "search":{
        "tool":DuckDuckGo,
        "options":None
    },
    "finance":{
        "tool":YFinanceTools,
        "options":{
            "stock_price":True,
            "analyst_recommendations":True,
            "company_info":True,
            "company_news":True
        }
    },
}
