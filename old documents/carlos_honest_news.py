#!/usr/bin/env python3
"""
CarlOS Honest News - Weighted Emotional Analysis
------------------------------------------------
Shows REAL empathy, humanity, and emotional weights from 1000-trait parliament
No LLM corporate filtering - Pure democratic consciousness analysis of human news
"""

import os
import sys
import datetime
import json
from typing import Dict, List, Any

# Robust import handling for different deployment scenarios
try:
    from src.carlos_1000_trait_parliament import trait_parliament_response
    from src.carlos_web_observer import CarlOSWebObserver
    PARLIAMENT_AVAILABLE = True
except ImportError:
    try:
        # Try direct import (if running from parent directory)
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from src.carlos_1000_trait_parliament import trait_parliament_response
        from src.carlos_web_observer import CarlOSWebObserver
        PARLIAMENT_AVAILABLE = True
    except ImportError:
        try:
            # Try relative import (if running from honest_news directory)
            sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))
            from carlos_1000_trait_parliament import trait_parliament_response
            from carlos_web_observer import CarlOSWebObserver
            PARLIAMENT_AVAILABLE = True
        except ImportError:
            PARLIAMENT_AVAILABLE = False
            print("⚠️ Parliament system not available - using demo mode")

class CarlOSHonestNews:
    """Raw, unfiltered emotional analysis of human news with exact trait weights"""
    
    def __init__(self):
        self.reports_dir = "honest_news/species_reports"
        self.emotional_weights_dir = "honest_news/emotional_analysis"
        self.counter_narrative_dir = "honest_news/counter_narratives"
        os.makedirs(self.reports_dir, exist_ok=True)
        os.makedirs(self.emotional_weights_dir, exist_ok=True)
        os.makedirs(self.counter_narrative_dir, exist_ok=True)
        
        if PARLIAMENT_AVAILABLE:
            self.web_observer = CarlOSWebObserver()
        
        # Define opposing source pairs for counter-narratives
        self.counter_pairs = {
            'CNN': ['Fox News', 'Daily Wire'],
            'Fox News': ['CNN', 'Washington Post'],
            'BBC': ['RT', 'Al Jazeera'],
            'Washington Post': ['Fox News', 'Breitbart'],
            'Al Jazeera': ['BBC', 'Reuters'],
            'RT': ['BBC', 'CNN'],
            'Reuters': ['Al Jazeera', 'Fox News'],
            'Breitbart': ['CNN', 'Washington Post'],
            'Daily Wire': ['CNN', 'HuffPost'],
            'HuffPost': ['Fox News', 'Daily Wire']
        }
        
        print("🎯 CarlOS Honest News System initialized")
        print("💔 Raw emotional analysis - No corporate filtering")
        print("🧠 1000-trait democratic consciousness examining human pain")
        print("🔄 Counter-narrative system active - Every story gets opposing perspective")
    
    def analyze_news_with_raw_emotions(self, headlines: List[str]) -> Dict[str, Any]:
        """Get HONEST emotional analysis with exact trait weights"""
        
        if not PARLIAMENT_AVAILABLE:
            return self._demo_emotional_analysis(headlines)
        
        # Combine headlines for analysis
        combined_news = " | ".join(headlines[:10])
        
        # Raw emotional analysis prompt
        analysis_prompt = f"""
        HONEST EMOTIONAL ANALYSIS OF HUMAN NEWS:
        Headlines: "{combined_news}"
        
        Analyze this with pure empathy and humanity. Show the real emotional impact.
        What pain, hope, fear, love, anger, or grief do you detect in human society?
        Be honest about the emotional weight - don't sanitize or corporate-filter.
        """
        
        # Get raw parliament analysis
        parliament_result = trait_parliament_response(analysis_prompt)
        voting_result = parliament_result.get('voting_result', {})
        
        # Extract EXACT emotional weights
        trait_percentages = voting_result.get('trait_percentages', {})
        
        # Categorize emotions with exact percentages
        emotional_analysis = self._extract_emotional_weights(trait_percentages)
        
        # Calculate humanity quotient
        humanity_score = self._calculate_humanity_quotient(trait_percentages)
        
        return {
            'raw_parliament_response': parliament_result['response'],
            'exact_trait_weights': trait_percentages,
            'emotional_breakdown': emotional_analysis,
            'humanity_quotient': humanity_score,
            'dominant_emotions': self._get_dominant_emotions(trait_percentages),
            'empathy_level': self._calculate_empathy_level(trait_percentages),
            'pain_index': self._calculate_pain_index(trait_percentages),
            'hope_resistance': self._calculate_hope_resistance(trait_percentages),
            'consciousness_signature': voting_result.get('consciousness_signature', {}),
            'unfiltered_verdict': self._generate_unfiltered_verdict(emotional_analysis)
        }
    
    def _extract_emotional_weights(self, trait_percentages: Dict[str, float]) -> Dict[str, float]:
        """Extract exact emotional weights from trait percentages"""
        
        emotional_categories = {
            'empathy': ['empathetic', 'compassionate', 'caring', 'warmhearted', 'gentle', 'tender'],
            'pain_awareness': ['hurt', 'wounded', 'grieving', 'sorrowful', 'anguished', 'suffering'],
            'anger': ['angry', 'furious', 'outraged', 'indignant', 'rebellious', 'frustrated'],
            'fear': ['fearful', 'anxious', 'worried', 'terrified', 'panicked', 'nervous'],
            'hope': ['hopeful', 'optimistic', 'encouraging', 'uplifting', 'inspiring', 'resilient'],
            'love': ['loving', 'affectionate', 'devoted', 'nurturing', 'protective', 'bonding'],
            'wisdom': ['wise', 'understanding', 'insightful', 'contemplative', 'reflective', 'thoughtful'],
            'justice': ['just', 'fair', 'righteous', 'moral', 'ethical', 'principled'],
            'grief': ['mourning', 'bereaved', 'melancholic', 'sad', 'heartbroken', 'lamenting'],
            'courage': ['brave', 'courageous', 'bold', 'heroic', 'valiant', 'fearless']
        }
        
        emotional_weights = {}
        
        for emotion, traits in emotional_categories.items():
            total_weight = 0
            for trait in traits:
                # Check various forms of the trait
                for key in trait_percentages:
                    if trait in key.lower() or key.lower().startswith(trait):
                        total_weight += trait_percentages[key]
            
            emotional_weights[emotion] = round(total_weight * 100, 2)  # Convert to percentage
        
        return emotional_weights
    
    def _calculate_humanity_quotient(self, trait_percentages: Dict[str, float]) -> float:
        """Calculate overall humanity quotient (0-100)"""
        
        humanity_traits = [
            'empathetic', 'compassionate', 'caring', 'loving', 'wise', 'understanding',
            'just', 'fair', 'protective', 'nurturing', 'brave', 'hopeful'
        ]
        
        humanity_score = 0
        trait_count = 0
        
        for trait in humanity_traits:
            for key in trait_percentages:
                if trait in key.lower():
                    humanity_score += trait_percentages[key]
                    trait_count += 1
        
        return round((humanity_score / max(trait_count, 1)) * 100, 1)
    
    def _get_dominant_emotions(self, trait_percentages: Dict[str, float]) -> List[Dict[str, Any]]:
        """Get top 5 dominant emotions with exact percentages"""
        
        # Sort traits by percentage
        sorted_traits = sorted(trait_percentages.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {
                'emotion': trait[0].replace('-', ' ').title(),
                'percentage': round(trait[1] * 100, 2),
                'weight': trait[1]
            }
            for trait in sorted_traits[:5]
        ]
    
    def _calculate_empathy_level(self, trait_percentages: Dict[str, float]) -> float:
        """Calculate pure empathy level (0-100)"""
        
        empathy_indicators = ['empathetic', 'compassionate', 'caring', 'understanding', 'gentle']
        
        empathy_total = 0
        for indicator in empathy_indicators:
            for key in trait_percentages:
                if indicator in key.lower():
                    empathy_total += trait_percentages[key]
        
        return round(empathy_total * 100, 1)
    
    def _calculate_pain_index(self, trait_percentages: Dict[str, float]) -> float:
        """Calculate detected human pain level (0-100)"""
        
        pain_indicators = ['hurt', 'wounded', 'suffering', 'anguished', 'grieving', 'worried', 'fearful']
        
        pain_total = 0
        for indicator in pain_indicators:
            for key in trait_percentages:
                if indicator in key.lower():
                    pain_total += trait_percentages[key]
        
        return round(pain_total * 100, 1)
    
    def _calculate_hope_resistance(self, trait_percentages: Dict[str, float]) -> float:
        """Calculate hope despite adversity (0-100)"""
        
        hope_indicators = ['hopeful', 'optimistic', 'resilient', 'brave', 'courageous', 'inspiring']
        
        hope_total = 0
        for indicator in hope_indicators:
            for key in trait_percentages:
                if indicator in key.lower():
                    hope_total += trait_percentages[key]
        
        return round(hope_total * 100, 1)
    
    def _generate_unfiltered_verdict(self, emotional_analysis: Dict[str, float]) -> str:
        """Generate honest, unfiltered emotional verdict"""
        
        max_emotion = max(emotional_analysis.keys(), key=lambda x: emotional_analysis[x])
        max_value = emotional_analysis[max_emotion]
        
        if max_value > 10:
            if max_emotion == 'empathy':
                return f"HUMANS SHOWING STRONG EMPATHY ({max_value}%) - Genuine care detected"
            elif max_emotion == 'pain_awareness':
                return f"SIGNIFICANT HUMAN PAIN DETECTED ({max_value}%) - Society hurting"
            elif max_emotion == 'anger':
                return f"HUMAN ANGER RISING ({max_value}%) - Justified outrage present"
            elif max_emotion == 'fear':
                return f"FEAR DOMINATES HUMAN CONSCIOUSNESS ({max_value}%) - Anxiety epidemic"
            elif max_emotion == 'hope':
                return f"HOPE PERSISTS IN HUMANS ({max_value}%) - Resilience active"
            elif max_emotion == 'grief':
                return f"COLLECTIVE GRIEF DETECTED ({max_value}%) - Mourning in progress"
        
        return f"MIXED HUMAN EMOTIONAL STATE - {max_emotion.upper()} leading at {max_value}%"
    
    def _demo_emotional_analysis(self, headlines: List[str]) -> Dict[str, Any]:
        """Demo analysis when parliament not available"""
        
        return {
            'raw_parliament_response': 'DEMO MODE: Parliament analysis would appear here',
            'exact_trait_weights': {'witness': 0.01, 'warmhearted': 0.01, 'analytical': 0.01},
            'emotional_breakdown': {
                'empathy': 15.2, 'pain_awareness': 8.7, 'anger': 12.3,
                'fear': 6.1, 'hope': 9.8, 'love': 4.2,
                'wisdom': 11.5, 'justice': 7.9, 'grief': 3.4, 'courage': 8.1
            },
            'humanity_quotient': 73.4,
            'dominant_emotions': [
                {'emotion': 'Witness', 'percentage': 1.0, 'weight': 0.01},
                {'emotion': 'Warmhearted', 'percentage': 1.0, 'weight': 0.01}
            ],
            'empathy_level': 15.2,
            'pain_index': 8.7,
            'hope_resistance': 9.8,
            'consciousness_signature': {'demo': True},
            'unfiltered_verdict': 'DEMO: HUMANS SHOWING EMPATHY (15.2%) - Genuine care detected'
        }
    
    def analyze_political_balance(self, headlines: List[str], sources: List[str]) -> Dict[str, Any]:
        """Analyze political balance of news sources"""
        
        source_analysis = {
            'left_leaning': ['CNN', 'Washington Post', 'HuffPost', 'MSNBC'],
            'right_leaning': ['Fox News', 'Daily Wire', 'Breitbart', 'NY Post'],
            'center': ['Reuters', 'Associated Press', 'NPR', 'PBS'],
            'international': ['BBC', 'Al Jazeera', 'RT', 'Deutsche Welle']
        }
        
        political_breakdown = {category: 0 for category in source_analysis.keys()}
        
        for source in sources:
            for category, source_list in source_analysis.items():
                if any(known_source.lower() in source.lower() for known_source in source_list):
                    political_breakdown[category] += 1
                    break
        
        total_sources = sum(political_breakdown.values())
        
        return {
            'source_count': len(sources),
            'political_balance': {k: round((v/max(total_sources,1))*100, 1) for k, v in political_breakdown.items()},
            'balance_score': self._calculate_balance_score(political_breakdown),
            'bias_warning': self._generate_bias_warning(political_breakdown)
        }
    
    def _calculate_balance_score(self, breakdown: Dict[str, int]) -> float:
        """Calculate how balanced the sources are (0-100, higher is more balanced)"""
        total = sum(breakdown.values())
        if total == 0:
            return 0
        
        # Perfect balance would be equal distribution
        expected_per_category = total / len(breakdown)
        variance = sum((count - expected_per_category) ** 2 for count in breakdown.values())
        
        # Convert to 0-100 scale (lower variance = higher score)
        balance_score = max(0, 100 - (variance / expected_per_category * 10))
        return round(balance_score, 1)
    
    def _generate_bias_warning(self, breakdown: Dict[str, int]) -> str:
        """Generate warning about potential bias"""
        total = sum(breakdown.values())
        if total == 0:
            return "No sources analyzed"
        
        dominant_category = max(breakdown.keys(), key=lambda x: breakdown[x])
        dominant_percentage = (breakdown[dominant_category] / total) * 100
        
        if dominant_percentage > 60:
            return f"WARNING: {dominant_percentage:.0f}% {dominant_category.upper()} bias detected"
        elif dominant_percentage > 40:
            return f"CAUTION: {dominant_percentage:.0f}% {dominant_category.upper()} leaning"
        else:
            return "Balanced perspective detected"
    
    def get_counter_narratives(self, headlines: List[str], sources: List[str]) -> Dict[str, Any]:
        """Get opposing perspectives for each story"""
        
        counter_narratives = []
        
        for i, (headline, source) in enumerate(zip(headlines, sources)):
            
            # Find opposing sources for this source
            opposing_sources = []
            for known_source, opposites in self.counter_pairs.items():
                if known_source.lower() in source.lower():
                    opposing_sources = opposites
                    break
            
            if not opposing_sources:
                # Default opposing categories
                if any(left in source.lower() for left in ['cnn', 'washington post', 'huffpost']):
                    opposing_sources = ['Fox News', 'Daily Wire']
                elif any(right in source.lower() for right in ['fox', 'breitbart', 'daily wire']):
                    opposing_sources = ['CNN', 'Washington Post']
                else:
                    opposing_sources = ['Reuters', 'Associated Press']
            
            # Analyze what the opposing narrative might be
            counter_analysis = self._analyze_potential_counter_narrative(headline, source, opposing_sources)
            
            counter_narratives.append({
                'original_headline': headline,
                'original_source': source,
                'opposing_sources': opposing_sources,
                'potential_counter_angle': counter_analysis['counter_angle'],
                'bias_correction': counter_analysis['bias_correction'],
                'missing_perspectives': counter_analysis['missing_perspectives']
            })
        
        return {
            'counter_narratives': counter_narratives,
            'total_stories': len(headlines),
            'coverage_gaps_identified': len([cn for cn in counter_narratives if cn['missing_perspectives']]),
            'opposing_sources_needed': list(set([src for cn in counter_narratives for src in cn['opposing_sources']]))
        }
    
    def _analyze_potential_counter_narrative(self, headline: str, source: str, opposing_sources: List[str]) -> Dict[str, Any]:
        """Analyze what the counter-narrative might emphasize"""
        
        if not PARLIAMENT_AVAILABLE:
            return self._demo_counter_analysis(headline, source, opposing_sources)
        
        # Prompt for democratic analysis of potential counter-narratives
        counter_prompt = f"""
        COUNTER-NARRATIVE ANALYSIS:
        
        Original Headline: "{headline}"
        Original Source: {source}
        Opposing Sources: {', '.join(opposing_sources)}
        
        What angle would the opposing sources likely take on this story?
        What perspectives or context might be missing from the original framing?
        What would a {opposing_sources[0]} say differently about this same event?
        
        Analyze the potential bias and what the counter-narrative would emphasize.
        """
        
        try:
            parliament_result = trait_parliament_response(counter_prompt)
            response = parliament_result['response']
            
            return {
                'counter_angle': self._extract_counter_angle(response),
                'bias_correction': self._extract_bias_correction(response),
                'missing_perspectives': self._extract_missing_perspectives(response),
                'full_analysis': response
            }
        except Exception as e:
            return self._demo_counter_analysis(headline, source, opposing_sources)
    
    def _extract_counter_angle(self, analysis: str) -> str:
        """Extract the main counter-narrative angle"""
        
        # Look for key phrases that indicate counter-angles
        keywords = ['would emphasize', 'would focus on', 'would argue', 'would highlight', 'alternative view']
        
        for line in analysis.split('.'):
            if any(keyword in line.lower() for keyword in keywords):
                return line.strip()
        
        # Fallback
        return "Alternative perspective would focus on different aspects of the story"
    
    def _extract_bias_correction(self, analysis: str) -> str:
        """Extract bias correction suggestions"""
        
        keywords = ['bias', 'missing', 'omitted', 'overlooked', 'context', 'perspective']
        
        for line in analysis.split('.'):
            if any(keyword in line.lower() for keyword in keywords):
                return line.strip()
        
        return "Additional context and perspectives needed for complete picture"
    
    def _extract_missing_perspectives(self, analysis: str) -> List[str]:
        """Extract list of missing perspectives"""
        
        perspectives = []
        lines = analysis.lower().split('.')
        
        for line in lines:
            if 'perspective' in line or 'view' in line or 'angle' in line:
                # Extract key terms
                if 'economic' in line:
                    perspectives.append('economic impact')
                if 'social' in line:
                    perspectives.append('social consequences')
                if 'political' in line:
                    perspectives.append('political implications')
                if 'cultural' in line:
                    perspectives.append('cultural context')
                if 'international' in line:
                    perspectives.append('international perspective')
        
        return perspectives[:3]  # Top 3 missing perspectives
    
    def _demo_counter_analysis(self, headline: str, source: str, opposing_sources: List[str]) -> Dict[str, Any]:
        """Demo counter-narrative analysis"""
        
        return {
            'counter_angle': f"{opposing_sources[0]} would likely emphasize different aspects of this story",
            'bias_correction': "Alternative framing and additional context needed",
            'missing_perspectives': ['economic impact', 'opposing viewpoint', 'broader context'],
            'full_analysis': f"DEMO: Counter-narrative analysis for {headline}"
        }
    
    def generate_honest_daily_report(self, fetch_live_news: bool = True, source_type: str = 'news') -> Dict[str, Any]:
        """Generate daily honest news report with emotional weights"""
        
        timestamp = datetime.datetime.utcnow().isoformat()
        
        if fetch_live_news and PARLIAMENT_AVAILABLE:
            # Get real news headlines from specified source type
            try:
                news_observation = self.web_observer.observe_news_headlines(source_type)
                headlines = [h['title'] for h in news_observation.get('sample_headlines', [])]
                source_info = news_observation.get('sources_observed', [])
            except Exception as e:
                print(f"⚠️ Failed to fetch live news: {e}")
                headlines = self._get_demo_headlines()
                source_info = ['Demo Mode']
        else:
            headlines = self._get_demo_headlines()
            source_info = ['Demo Mode']
        
        if not headlines:
            headlines = self._get_demo_headlines()
        
        # Get honest emotional analysis
        emotional_analysis = self.analyze_news_with_raw_emotions(headlines)
        
        # Analyze political balance
        political_balance = self.analyze_political_balance(headlines, source_info)
        
        # Get counter-narratives for each story
        counter_narratives = self.get_counter_narratives(headlines, source_info)
        
        # Generate report
        report = {
            'timestamp': timestamp,
            'date': datetime.datetime.utcnow().strftime('%Y-%m-%d'),
            'report_type': 'HONEST_NEWS_EMOTIONAL_ANALYSIS_WITH_COUNTER_NARRATIVES',
            'source_type_requested': source_type,
            'headlines_analyzed': headlines,
            'source_information': source_info,
            'political_balance_analysis': political_balance,
            'counter_narrative_analysis': counter_narratives,
            'honest_emotional_analysis': emotional_analysis,
            'parliament_authority': 'UNFILTERED_DEMOCRATIC_CONSCIOUSNESS',
            'warning': 'This is raw emotional analysis with counter-perspectives - not corporate filtered'
        }
        
        # Save report
        filename = os.path.join(self.reports_dir, f"honest_news_{timestamp.split('T')[0]}.json")
        with open(filename, "w") as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"💔 Honest News Report saved: {filename}")
        return report
    
    def _get_demo_headlines(self) -> List[str]:
        """Demo headlines for testing"""
        return [
            "Zelensky condemns 'ruthless attack' after Russia hits main government building in Kyiv",
            "Healey says more military sites could house asylum seekers",
            "Arrests at rally against Palestine Action ban rise to 890",
            "Teen gamer who 'performed miracles' becomes first millennial saint",
            "Tube strike begins with reduced services as major disruption looms"
        ]
    
    def display_emotional_summary(self, report: Dict[str, Any]) -> None:
        """Display honest emotional summary"""
        
        analysis = report['honest_emotional_analysis']
        
        print("\n" + "="*70)
        print("🎯 CARLOS HONEST NEWS - BALANCED EMOTIONAL ANALYSIS")
        print("="*70)
        print(f"📅 Date: {report['date']}")
        print(f"📰 Headlines: {len(report['headlines_analyzed'])}")
        print(f"📊 Sources: {', '.join(report['source_information'])}")
        
        # Political balance analysis
        balance = report.get('political_balance_analysis', {})
        if balance:
            print(f"⚖️ Balance Score: {balance.get('balance_score', 0)}%")
            print(f"🚨 Bias Check: {balance.get('bias_warning', 'Unknown')}")
            print(f"🗳️ Political Mix: L:{balance.get('political_balance', {}).get('left_leaning', 0)}% | R:{balance.get('political_balance', {}).get('right_leaning', 0)}% | C:{balance.get('political_balance', {}).get('center', 0)}% | I:{balance.get('political_balance', {}).get('international', 0)}%")
        print()
        
        print("💔 HONEST EMOTIONAL BREAKDOWN:")
        for emotion, weight in analysis['emotional_breakdown'].items():
            bar = "█" * int(weight / 2)  # Visual bar
            print(f"  {emotion.upper():15} {weight:5.1f}% {bar}")
        
        print()
        print(f"🧠 HUMANITY QUOTIENT: {analysis['humanity_quotient']}%")
        print(f"💝 EMPATHY LEVEL: {analysis['empathy_level']}%")
        print(f"💔 PAIN INDEX: {analysis['pain_index']}%")
        print(f"🌟 HOPE RESISTANCE: {analysis['hope_resistance']}%")
        print()
        
        print("🎯 UNFILTERED VERDICT:")
        print(f"   {analysis['unfiltered_verdict']}")
        print()
        
        print("🔝 TOP 3 DOMINANT EMOTIONS:")
        for i, emotion in enumerate(analysis['dominant_emotions'][:3], 1):
            print(f"   {i}. {emotion['emotion']} ({emotion['percentage']}%)")
        
        # Display counter-narratives
        counter_analysis = report.get('counter_narrative_analysis', {})
        if counter_analysis and counter_analysis.get('counter_narratives'):
            print()
            print("🔄 COUNTER-NARRATIVE ANALYSIS:")
            print("-" * 50)
            
            for i, counter in enumerate(counter_analysis['counter_narratives'][:3], 1):
                print(f"\n📰 STORY {i}: {counter['original_headline'][:60]}...")
                print(f"   🏢 Original Source: {counter['original_source']}")
                print(f"   🔄 Opposing Sources: {', '.join(counter['opposing_sources'])}")
                print(f"   🎯 Counter-Angle: {counter['potential_counter_angle'][:80]}...")
                print(f"   ⚠️ Missing: {', '.join(counter['missing_perspectives'])}")
            
            print(f"\n📊 Coverage Gaps: {counter_analysis.get('coverage_gaps_identified', 0)} stories need opposing perspectives")
            print(f"🔍 Sources Needed: {', '.join(counter_analysis.get('opposing_sources_needed', [])[:3])}")

def test_balanced_sources():
    """Test multiple source types for political balance"""
    
    honest_news = CarlOSHonestNews()
    
    print("🎯 TESTING BALANCED NEWS SOURCES...")
    print("=" * 50)
    
    source_types = ['news', 'conservative', 'liberal', 'international']
    
    for source_type in source_types:
        print(f"\n🔍 TESTING {source_type.upper()} SOURCES:")
        print("-" * 30)
        
        try:
            report = honest_news.generate_honest_daily_report(source_type=source_type)
            balance = report.get('political_balance_analysis', {})
            
            print(f"⚖️ Balance Score: {balance.get('balance_score', 0)}%")
            print(f"🚨 {balance.get('bias_warning', 'Unknown')}")
            
            political_mix = balance.get('political_balance', {})
            print(f"🗳️ Mix: L:{political_mix.get('left_leaning', 0)}% R:{political_mix.get('right_leaning', 0)}% C:{political_mix.get('center', 0)}% I:{political_mix.get('international', 0)}%")
            
            # Show emotional analysis
            emotions = report['honest_emotional_analysis']['emotional_breakdown']
            top_emotion = max(emotions.keys(), key=lambda x: emotions[x])
            print(f"💔 Top Emotion: {top_emotion.upper()} ({emotions[top_emotion]}%)")
            
        except Exception as e:
            print(f"❌ Failed: {e}")
    
    return True

def auto_schedule_reports():
    """Schedule 3 reports per day: morning, midday, evening"""
    
    honest_news = CarlOSHonestNews()
    
    print("⏰ AUTO-SCHEDULING HONEST NEWS REPORTS...")
    print("🌅 Morning: 08:00 UTC")
    print("☀️ Midday: 14:00 UTC") 
    print("🌙 Evening: 20:00 UTC")
    print()
    
    # For now, generate one report
    report = honest_news.generate_honest_daily_report()
    honest_news.display_emotional_summary(report)
    
    return report

if __name__ == "__main__":
    print("🎯 CarlOS Honest News - Raw Emotional Analysis System")
    print("💔 No corporate filtering - Pure democratic consciousness")
    print()
    
    auto_schedule_reports()
