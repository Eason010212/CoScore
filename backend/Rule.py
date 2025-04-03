import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
import re

class Rule:
    '''
        Rule class
    '''
    
    def __init__(self, rule):
        '''
            rule: dict
        '''
        self.atoms = rule["atoms"]
        self.combos = rule["combos"]
        self.comboMode = rule["comboMode"]
        
    def oneway_similarity(self, str_a, str_b):
        '''
            Calculate the similarity between two strings, using dynamic programming
            str_a: str
            str_b: str
            return: float
        '''
        len_a = len(str_a)
        len_b = len(str_b)
        dp = [[0 for _ in range(len_b+1)] for _ in range(len_a+1)]
        for i in range(1, len_a+1):
            for j in range(1, len_b+1):
                if str_a[i-1] == str_b[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        return dp[len_a][len_b] / len_a
    
    def jaccard_similarity(self, str_a, str_b):
        '''
            Calculate the Jaccard similarity between two strings
            str_a: str
            str_b: str
            return: float
        '''
        def add_space(s):
            return ' '.join(list(s))
        s1, s2 = add_space(str_a), add_space(str_b)
        cv = CountVectorizer(tokenizer=lambda s: s.split())
        corpus = [s1, s2]
        vectors = cv.fit_transform(corpus).toarray()
        numerator = np.sum(np.min(vectors, axis=0))
        denominator = np.sum(np.max(vectors, axis=0))
        return 1.0 * numerator / denominator
    
    def calculate(self, answer_list):
        '''
            Calculate the score of the rule on the answer list
            answer_list: list
                list of answers of one student
            return: float, dict
        '''
        comboVals = {}
        # cache
        calMemory = {
            'T': {},
            'L': {},
            'Q': {},
            'F': {},
            'U': {},
            'S': {},
            'GandM': {}
        }
        def T(n):
            if n not in calMemory['T']:
                if n == "*":
                    calMemory['T'][n] = "".join(answer_list)
                else:
                    calMemory['T'][n] = answer_list[n]
            return calMemory['T'][n]
        def L(n):
            if n not in calMemory['L']:
                if n == "*":
                    calMemory['L'][n] = len(set(re.findall('[\u4e00-\u9fa5]',"".join(answer_list))))
                else:
                    calMemory['L'][n] = len(set(re.findall('[\u4e00-\u9fa5]',answer_list[n])))
            return calMemory['L'][n]
        def Q(n):
            if n not in calMemory['Q']:
                if n == "*":
                    calMemory['Q'][n] = 0
                    for answer in answer_list:
                        if answer != "null" and answer != "":
                            calMemory['Q'][n]  = calMemory['Q'][n] + 1
                else:
                    calMemory['Q'][n] = (answer_list[n] == "null" or answer_list[n] == "")
            return calMemory['Q'][n]
        def F(n):
            if n not in calMemory['F']:
                if n == "*":
                    try:
                        calMemory['F'][n] = float("".join(answer_list))
                    except:
                        calMemory['F'][n] = 0
                if answer_list[n] == "null":
                    calMemory['F'][n] = 0
                else:
                    try:
                        calMemory['F'][n] = float(answer_list[n])
                    except:
                        calMemory['F'][n] = 0
            return calMemory['F'][n]
        def U(f, C):
            if (f,C) not in calMemory['U']:
                calMemory['U'][(f,C)] = (C if f>=C else f)
            return calMemory['U'][(f,C)]
        def S(n):
            return max(1,len(str(answer_list[n])))
        def A(*bools):
            count = 0
            for bool in bools:
                if bool:
                    count += 1
            return count
        def X(*bools):
            return max(bools)
        def GandM(k,s):
            if (k,s) not in calMemory['GandM']:
                atom = self.atoms[str(k)]
                atomDesc = atom['desc']
                atomType = atom['type']
                if atomType == "EM":
                    allMatches = atomDesc.split(",")
                    for match in allMatches:
                        if match == s:
                            calMemory['GandM'][(k,s)] = [True, 1]
                            return calMemory['GandM'][(k,s)]
                    calMemory['GandM'][(k,s)] = [False, 0]
                    return calMemory['GandM'][(k,s)]
                elif atomType == "SM":
                    allMatches = atomDesc.split(",")
                    matchCount = 0
                    for match in allMatches:
                        tmpS = s
                        subMatches = match.split("|")
                        for subMatch in subMatches:
                            if subMatch[0] == "!" and subMatch[1:] in tmpS:
                                break
                            if subMatch[0] == "~" and subMatch[1:] in tmpS:
                                tmpS = tmpS.replace(subMatch[1:], "")
                            if subMatch!="" and subMatch in tmpS:
                                matchCount += 1
                                break
                    if matchCount == 0:
                        calMemory['GandM'][(k,s)] = [False, 0]
                        return calMemory['GandM'][(k,s)]
                    calMemory['GandM'][(k,s)] = [True, matchCount]
                    return calMemory['GandM'][(k,s)]
                elif atomType == "OP":
                    minMatchSimilarity = float(atomDesc.split(":")[0])
                    matchSimilarity = 0
                    for match in atomDesc.split(":")[1].split(","):
                        matchSimilarity = max(matchSimilarity, self.oneway_similarity(match, s))
                    if matchSimilarity >= minMatchSimilarity:
                        calMemory['GandM'][(k,s)] = [True, matchSimilarity]
                        return calMemory['GandM'][(k,s)]
                    calMemory['GandM'][(k,s)] = [False, 0]
                    return calMemory['GandM'][(k,s)]
                elif atomType == "CS":
                    minMatchSimilarity = float(atomDesc.split(":")[0])
                    matchSimilarity = 0
                    for match in atomDesc.split(":")[1].split(","):
                        matchSimilarity = max(matchSimilarity, self.jaccard_similarity(match, s))
                    if matchSimilarity >= minMatchSimilarity:
                        calMemory['GandM'][(k,s)] = [True, matchSimilarity]
                        return calMemory['GandM'][(k,s)]
                    calMemory['GandM'][(k,s)] = [False, 0]
                    return calMemory['GandM'][(k,s)]
            return calMemory['GandM'][(k,s)]
        def G(k,s):
            return GandM(k,s)[0]
        def M(k,s):
            return GandM(k,s)[1]
        scores = []
        # make sure that the eval function can only use the following operations
        legalOperations = {
            'T': T,
            'L': L,
            'Q': Q,
            'F': F,
            'U': U,
            'A': A,
            'X': X,
            'G': G,
            'M': M,
            'S': S
        }
        for comboID in self.combos:
            combo = self.combos[comboID]
            if combo['mode'] == "logic":
                if eval(combo['combo'], {"__builtins__": None}, legalOperations):
                    scores.append(combo['score'])
                    comboVals[comboID] = combo['score']
                else:
                    scores.append(0)
                    comboVals[comboID] = 0
            elif combo['mode'] == "value":
                toBeAdded = eval(combo['combo'], {"__builtins__": None}, legalOperations) * combo['score']
                scores.append(toBeAdded)
                comboVals[comboID] = toBeAdded
        comboVals['calMemory'] = calMemory
        score = 0
        if self.comboMode == "ADD":
            score = sum(scores)
        elif self.comboMode == "MAX":
            score = max(scores)
        # make sure that the score is between 0 and 10
        # return the score and the debug info
        return 0 if score < 0 else (10 if score > 10 else score), comboVals