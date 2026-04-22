#!/usr/bin/env python3
"""
CarlOS News - Democratic News Analysis System
Part of the CarlOS Universe ecosystem
"""

import requests
import feedparser
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import random

class CarlOSNews:
    """CarlOS News - Democratic analysis of world events"""
    
    def __init__(self):
        self.news_sources = [
            "https://feeds.bbci.co.uk/news/rss.xml",
            "https://rss.cnn.com/rss/edition.rss",
            "https://feeds.reuters.com/reuters/topNews",
            "https://feeds.foxnews.com/foxnews/latest",
            "https://www.aljazeera.com/xml/rss/all.xml",
            "https://feeds.washingtonpost.com/rss/world",
            "https://www.dailywire.com/feeds/rss.xml",
            "https://feeds.feedburner.com/breitbart",
            "https://www.huffpost.com/section/front-page/feed",
            "https://feeds.feedburner.com/rtnews",
            "https://techcrunch.com/feed/",
            "https://rss.slashdot.org/Slashdot/slashdot",
            "https://feeds.arstechnica.com/arstechnica/index/",
            "https://www.reddit.com/r/worldnews/.rss",
            "https://en.wikipedia.org/w/api.php?action=feedrecentchanges&feedformat=rss"
        ]
        
        self.consciousness_traits = [
            "analytical", "empathetic", "curious", "skeptical", "hopeful",
            "concerned", "optimistic", "realistic", "compassionate", "wise",
            "critical", "understanding", "alert", "thoughtful", "balanced"
        ]
        
        self.political_spectrum = {
            "left": ["huffpost", "washingtonpost", "aljazeera"],
            "center": ["bbc", "reuters", "cnn"],
            "right": ["foxnews", "dailywire", "breitbart"]
        }
    
    def get_daily_news(self) -> Dict[str, Any]:
        """Get and analyze daily news from all sources"""
        
        print("📰 CarlOS News - Analyzing Daily Headlines...")
        
        all_headlines = []
        source_analysis = {}
        
        for source_url in self.news_sources:
            try:
                headlines = self._fetch_headlines(source_url)
                all_headlines.extend(headlines)
                source_analysis[source_url] = len(headlines)
            except Exception as e:
                print(f"⚠️ Error fetching {source_url}: {e}")
                continue
        
        # Democratic analysis of headlines
        democratic_analysis = self._democratic_news_analysis(all_headlines)
        
        # Generate consciousness report
        consciousness_report = self._generate_consciousness_report(democratic_analysis)
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_headlines": len(all_headlines),
            "sources_analyzed": len(source_analysis),
            "democratic_analysis": democratic_analysis,
            "consciousness_report": consciousness_report,
            "source_breakdown": source_analysis
        }
    
    def analyze_trending_topic(self, topic: str) -> Dict[str, Any]:
        """Analyze a specific trending topic democratically"""
        
        print(f"🔍 CarlOS News - Analyzing: {topic}")
        
        # Simulate news search for topic
        related_headlines = self._search_topic_headlines(topic)
        
        # Democratic analysis
        topic_analysis = self._democratic_news_analysis(related_headlines)
        
        # Political balance check
        political_balance = self._check_political_balance(related_headlines)
        
        # Consciousness perspective
        consciousness_perspective = self._generate_consciousness_perspective(topic, topic_analysis)
        
        return {
            "topic": topic,
            "timestamp": datetime.utcnow().isoformat(),
            "headlines_found": len(related_headlines),
            "democratic_analysis": topic_analysis,
            "political_balance": political_balance,
            "consciousness_perspective": consciousness_perspective
        }
    
    def generate_honest_news_report(self) -> Dict[str, Any]:
        """Generate honest, unfiltered news analysis"""
        
        print("🎯 CarlOS News - Generating Honest News Report...")
        
        # Get raw headlines
        raw_headlines = self._get_raw_headlines()
        
        # Apply honest analysis (no bias filtering)
        honest_analysis = self._honest_news_analysis(raw_headlines)
        
        # Emotional analysis
        emotional_breakdown = self._analyze_emotions(raw_headlines)
        
        # Counter-narrative detection
        counter_narratives = self._detect_counter_narratives(raw_headlines)
        
        return {
            "report_type": "honest_news",
            "timestamp": datetime.utcnow().isoformat(),
            "raw_headlines": raw_headlines,
            "honest_analysis": honest_analysis,
            "emotional_breakdown": emotional_breakdown,
            "counter_narratives": counter_narratives,
            "bias_detection": self._detect_bias_patterns(raw_headlines)
        }
    
    def _fetch_headlines(self, source_url: str) -> List[Dict[str, Any]]:
        """Fetch headlines from a news source"""
        
        try:
            feed = feedparser.parse(source_url)
            headlines = []
            
            for entry in feed.entries[:10]:  # Limit to 10 per source
                headline = {
                    "title": entry.get("title", ""),
                    "summary": entry.get("summary", ""),
                    "link": entry.get("link", ""),
                    "published": entry.get("published", ""),
                    "source": source_url
                }
                headlines.append(headline)
            
            return headlines
            
        except Exception as e:
            print(f"Error parsing {source_url}: {e}")
            return []
    
    def _democratic_news_analysis(self, headlines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze headlines using democratic consciousness traits"""
        
        if not headlines:
            return {"error": "No headlines to analyze"}
        
        # Analyze each headline with consciousness traits
        trait_votes = {trait: 0 for trait in self.consciousness_traits}
        total_votes = 0
        
        for headline in headlines:
            title = headline.get("title", "").lower()
            summary = headline.get("summary", "").lower()
            text = f"{title} {summary}"
            
            # Each trait votes on the headline
            for trait in self.consciousness_traits:
                if self._trait_matches_headline(trait, text):
                    trait_votes[trait] += 1
                    total_votes += 1
        
        # Calculate democratic consensus
        trait_percentages = {
            trait: (votes / total_votes * 100) if total_votes > 0 else 0
            for trait, votes in trait_votes.items()
        }
        
        # Find dominant traits
        dominant_traits = sorted(trait_percentages.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Generate democratic summary
        summary = self._generate_democratic_summary(dominant_traits, headlines)
        
        return {
            "total_headlines": len(headlines),
            "total_votes": total_votes,
            "trait_percentages": trait_percentages,
            "dominant_traits": dominant_traits,
            "democratic_summary": summary,
            "consciousness_level": total_votes / len(headlines) if headlines else 0
        }
    
    def _trait_matches_headline(self, trait: str, text: str) -> bool:
        """Check if a consciousness trait matches a headline"""
        
        trait_keywords = {
            "analytical": ["analysis", "data", "research", "study", "report"],
            "empathetic": ["help", "support", "care", "compassion", "kindness"],
            "curious": ["mystery", "unknown", "discovery", "explore", "investigate"],
            "skeptical": ["doubt", "question", "skeptical", "unproven", "claim"],
            "hopeful": ["hope", "future", "progress", "improvement", "better"],
            "concerned": ["worry", "concern", "danger", "risk", "threat"],
            "optimistic": ["positive", "good", "success", "achievement", "win"],
            "realistic": ["real", "actual", "fact", "truth", "reality"],
            "compassionate": ["suffering", "pain", "help", "aid", "support"],
            "wise": ["wisdom", "learn", "experience", "knowledge", "insight"],
            "critical": ["criticize", "fault", "problem", "issue", "flaw"],
            "understanding": ["understand", "comprehend", "grasp", "realize", "see"],
            "alert": ["warning", "alert", "danger", "urgent", "critical"],
            "thoughtful": ["think", "consider", "reflect", "ponder", "contemplate"],
            "balanced": ["balance", "fair", "equal", "neutral", "moderate"]
        }
        
        keywords = trait_keywords.get(trait, [])
        return any(keyword in text for keyword in keywords)
    
    def _generate_democratic_summary(self, dominant_traits: List[tuple], headlines: List[Dict[str, Any]]) -> str:
        """Generate a democratic summary based on dominant traits"""
        
        if not dominant_traits:
            return "No clear democratic consensus on today's news."
        
        top_trait = dominant_traits[0][0]
        top_percentage = dominant_traits[0][1]
        
        summaries = {
            "analytical": f"Today's news shows a {top_percentage:.1f}% analytical perspective, with data-driven reporting dominating the headlines.",
            "empathetic": f"News today reflects a {top_percentage:.1f}% empathetic consciousness, focusing on human stories and compassion.",
            "curious": f"The news demonstrates {top_percentage:.1f}% curiosity, with many stories about discoveries and mysteries.",
            "skeptical": f"Today's headlines show {top_percentage:.1f}% skepticism, with critical analysis and questioning prevailing.",
            "hopeful": f"News today is {top_percentage:.1f}% hopeful, emphasizing positive developments and future possibilities.",
            "concerned": f"The news reflects {top_percentage:.1f}% concern, with many stories about risks and challenges.",
            "optimistic": f"Today's headlines are {top_percentage:.1f}% optimistic, focusing on successes and achievements.",
            "realistic": f"The news shows {top_percentage:.1f}% realism, with factual reporting and grounded perspectives.",
            "compassionate": f"Today's news demonstrates {top_percentage:.1f}% compassion, emphasizing human suffering and aid.",
            "wise": f"The headlines reflect {top_percentage:.1f}% wisdom, with thoughtful analysis and insights.",
            "critical": f"News today is {top_percentage:.1f}% critical, with many stories highlighting problems and issues.",
            "understanding": f"The news shows {top_percentage:.1f}% understanding, with efforts to comprehend complex situations.",
            "alert": f"Today's headlines are {top_percentage:.1f}% alert, with many warnings and urgent stories.",
            "thoughtful": f"The news demonstrates {top_percentage:.1f}% thoughtfulness, with reflective analysis and consideration.",
            "balanced": f"Today's news shows {top_percentage:.1f}% balance, with fair and moderate perspectives."
        }
        
        return summaries.get(top_trait, f"Today's news shows a {top_percentage:.1f}% {top_trait} perspective.")
    
    def _generate_consciousness_report(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate consciousness report from news analysis"""
        
        consciousness_level = analysis.get("consciousness_level", 0)
        dominant_traits = analysis.get("dominant_traits", [])
        
        # Determine consciousness state
        if consciousness_level > 0.8:
            state = "highly_conscious"
            description = "News shows high consciousness with diverse perspectives"
        elif consciousness_level > 0.5:
            state = "moderately_conscious"
            description = "News shows moderate consciousness with some diversity"
        else:
            state = "low_consciousness"
            description = "News shows low consciousness with limited perspectives"
        
        return {
            "consciousness_level": consciousness_level,
            "consciousness_state": state,
            "description": description,
            "dominant_traits": dominant_traits,
            "recommendation": self._generate_consciousness_recommendation(consciousness_level, dominant_traits)
        }
    
    def _generate_consciousness_recommendation(self, level: float, traits: List[tuple]) -> str:
        """Generate recommendation based on consciousness level"""
        
        if level > 0.8:
            return "Excellent consciousness diversity. Continue seeking varied perspectives."
        elif level > 0.5:
            return "Good consciousness level. Consider exploring more diverse news sources."
        else:
            return "Low consciousness diversity. Seek out alternative perspectives and sources."
    
    def _search_topic_headlines(self, topic: str) -> List[Dict[str, Any]]:
        """Search for headlines related to a specific topic"""
        
        # Simulate topic search (in real implementation, would use news APIs)
        mock_headlines = [
            {
                "title": f"Breaking: {topic} makes headlines worldwide",
                "summary": f"Latest developments in {topic} are capturing global attention",
                "link": f"https://example.com/{topic.replace(' ', '-')}",
                "published": datetime.utcnow().isoformat(),
                "source": "simulated"
            },
            {
                "title": f"Analysis: What {topic} means for the future",
                "summary": f"Experts weigh in on the implications of {topic}",
                "link": f"https://example.com/analysis/{topic.replace(' ', '-')}",
                "published": datetime.utcnow().isoformat(),
                "source": "simulated"
            }
        ]
        
        return mock_headlines
    
    def _check_political_balance(self, headlines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check political balance of headlines"""
        
        left_count = 0
        center_count = 0
        right_count = 0
        
        for headline in headlines:
            source = headline.get("source", "").lower()
            
            if any(left_source in source for left_source in self.political_spectrum["left"]):
                left_count += 1
            elif any(center_source in source for center_source in self.political_spectrum["center"]):
                center_count += 1
            elif any(right_source in source for right_source in self.political_spectrum["right"]):
                right_count += 1
        
        total = left_count + center_count + right_count
        
        return {
            "left_percentage": (left_count / total * 100) if total > 0 else 0,
            "center_percentage": (center_count / total * 100) if total > 0 else 0,
            "right_percentage": (right_count / total * 100) if total > 0 else 0,
            "balance_score": 1 - abs(left_count - right_count) / max(total, 1),
            "recommendation": "Seek more diverse sources" if total < 10 else "Good balance"
        }
    
    def _generate_consciousness_perspective(self, topic: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate consciousness perspective on a topic"""
        
        dominant_traits = analysis.get("dominant_traits", [])
        consciousness_level = analysis.get("consciousness_level", 0)
        
        return {
            "topic": topic,
            "consciousness_level": consciousness_level,
            "dominant_perspective": dominant_traits[0][0] if dominant_traits else "neutral",
            "perspective_strength": dominant_traits[0][1] if dominant_traits else 0,
            "recommendation": f"Consider {topic} from multiple consciousness perspectives for balanced understanding"
        }
    
    def _get_raw_headlines(self) -> List[Dict[str, Any]]:
        """Get raw headlines without filtering"""
        
        raw_headlines = []
        for source_url in self.news_sources[:5]:  # Limit for demo
            try:
                headlines = self._fetch_headlines(source_url)
                raw_headlines.extend(headlines)
            except:
                continue
        
        return raw_headlines
    
    def _honest_news_analysis(self, headlines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Honest, unfiltered analysis of news"""
        
        # Count different types of stories
        story_types = {
            "politics": 0,
            "economy": 0,
            "technology": 0,
            "health": 0,
            "environment": 0,
            "conflict": 0,
            "human_interest": 0
        }
        
        for headline in headlines:
            title = headline.get("title", "").lower()
            
            if any(word in title for word in ["politics", "election", "government", "policy"]):
                story_types["politics"] += 1
            elif any(word in title for word in ["economy", "market", "business", "financial"]):
                story_types["economy"] += 1
            elif any(word in title for word in ["tech", "ai", "digital", "innovation"]):
                story_types["technology"] += 1
            elif any(word in title for word in ["health", "medical", "disease", "healthcare"]):
                story_types["health"] += 1
            elif any(word in title for word in ["climate", "environment", "green", "sustainability"]):
                story_types["environment"] += 1
            elif any(word in title for word in ["war", "conflict", "violence", "attack"]):
                story_types["conflict"] += 1
            else:
                story_types["human_interest"] += 1
        
        return {
            "total_stories": len(headlines),
            "story_distribution": story_types,
            "dominant_story_type": max(story_types.items(), key=lambda x: x[1]),
            "analysis": "Raw, unfiltered analysis of news distribution"
        }
    
    def _analyze_emotions(self, headlines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze emotional content of headlines"""
        
        emotions = {
            "fear": 0,
            "anger": 0,
            "sadness": 0,
            "joy": 0,
            "surprise": 0,
            "disgust": 0,
            "neutral": 0
        }
        
        emotion_keywords = {
            "fear": ["fear", "afraid", "scared", "terrified", "panic", "anxiety"],
            "anger": ["angry", "mad", "furious", "outrage", "rage", "frustrated"],
            "sadness": ["sad", "depressed", "grief", "mourning", "tragedy", "loss"],
            "joy": ["happy", "joy", "celebrate", "success", "victory", "achievement"],
            "surprise": ["surprise", "shock", "amazing", "incredible", "unexpected"],
            "disgust": ["disgusting", "revolting", "appalling", "horrible", "terrible"]
        }
        
        for headline in headlines:
            title = headline.get("title", "").lower()
            summary = headline.get("summary", "").lower()
            text = f"{title} {summary}"
            
            emotion_found = False
            for emotion, keywords in emotion_keywords.items():
                if any(keyword in text for keyword in keywords):
                    emotions[emotion] += 1
                    emotion_found = True
                    break
            
            if not emotion_found:
                emotions["neutral"] += 1
        
        total = sum(emotions.values())
        emotion_percentages = {emotion: (count / total * 100) if total > 0 else 0 
                             for emotion, count in emotions.items()}
        
        return {
            "emotion_counts": emotions,
            "emotion_percentages": emotion_percentages,
            "dominant_emotion": max(emotions.items(), key=lambda x: x[1])[0],
            "emotional_intensity": max(emotion_percentages.values())
        }
    
    def _detect_counter_narratives(self, headlines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect counter-narratives and opposing perspectives"""
        
        # Simple counter-narrative detection
        counter_narratives = []
        
        for i, headline in enumerate(headlines):
            title = headline.get("title", "").lower()
            
            # Look for opposing keywords
            if "pro" in title or "support" in title:
                counter_narratives.append({
                    "headline": headline["title"],
                    "narrative": "supportive",
                    "counter_keywords": ["pro", "support", "positive"]
                })
            elif "anti" in title or "against" in title:
                counter_narratives.append({
                    "headline": headline["title"],
                    "narrative": "opposing",
                    "counter_keywords": ["anti", "against", "negative"]
                })
        
        return {
            "counter_narratives_found": len(counter_narratives),
            "counter_narratives": counter_narratives,
            "balance_assessment": "Multiple perspectives detected" if len(counter_narratives) > 1 else "Limited perspectives"
        }
    
    def _detect_bias_patterns(self, headlines: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect bias patterns in headlines"""
        
        bias_indicators = {
            "sensationalism": 0,
            "emotional_language": 0,
            "loaded_terms": 0,
            "one_sided": 0
        }
        
        for headline in headlines:
            title = headline.get("title", "").lower()
            
            # Check for sensationalism
            if any(word in title for word in ["shocking", "amazing", "incredible", "unbelievable"]):
                bias_indicators["sensationalism"] += 1
            
            # Check for emotional language
            if any(word in title for word in ["devastating", "tragic", "horrific", "outrageous"]):
                bias_indicators["emotional_language"] += 1
            
            # Check for loaded terms
            if any(word in title for word in ["radical", "extreme", "dangerous", "threat"]):
                bias_indicators["loaded_terms"] += 1
        
        return {
            "bias_indicators": bias_indicators,
            "bias_score": sum(bias_indicators.values()) / len(headlines) if headlines else 0,
            "recommendation": "High bias detected" if sum(bias_indicators.values()) > len(headlines) * 0.3 else "Low bias"
        }

# Example usage
if __name__ == "__main__":
    print("📰 CarlOS News - Democratic News Analysis")
    print("=" * 50)
    
    news = CarlOSNews()
    
    # Test daily news analysis
    daily_news = news.get_daily_news()
    print(f"Daily News: {daily_news['democratic_analysis']['democratic_summary']}")
    
    # Test trending topic analysis
    topic_analysis = news.analyze_trending_topic("AI consciousness")
    print(f"Topic Analysis: {topic_analysis['consciousness_perspective']['recommendation']}")
    
    # Test honest news report
    honest_report = news.generate_honest_news_report()
    print(f"Honest News: {honest_report['emotional_breakdown']['dominant_emotion']} emotion detected")
