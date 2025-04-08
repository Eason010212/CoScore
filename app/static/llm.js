manual = `CoScore规则编制规范
1 基本形式
使用结构化的JSON语言代替描述评分规则的自然语言，由原子规则（atoms）、组合规则（combos）、组合模式（comboMode）三部分构成，如例1。
例1 基本形式示意
{
    "atoms":{...},
    "combos":{...},
    "comboMode": "ADD" 
}
其中，原子规则（atoms）用以表示使用的评分规则，由若干个原子单元组成；组合规则（combos）用以表示评分规则的组合计分方式，由若干个组合单元组成。
2 具体约定
2.1 原子规则（atoms）
由若干个原子单元构成，如例2。每个原子单元持有一个数字id作为键，对应的值为一个JSON单元，由规则类型（type）、规则描述（desc）两部分构成。
原子规则在被调用时，会返回两项值。一项为逻辑值，表示规则的命中情况，取值范围为[True, False]；一项为求解值，表示规则命中的数值。
一般地，当逻辑值为True时，求解值大于0；当逻辑值为False时，求解值为0.
例2 基本形式示意（atoms）
{
    "atoms":{
        "0":{
            "type": "EM",
            "desc": "你好"
        }
        "1":{...}
    },
    "combos":{...}
}
规则类型（type）与规则描述（desc）的规范性约定见3.1.1-3.1.6。
2.1.1 完全精确匹配规则 EM
2.1.1.1 规则类型（type）设定为EM时，表示该原子单元是一个完全精确匹配规则单元。 
2.1.1.2 在2.1.1.1约定的情况下，规则描述（desc）必须是一个字符串。字符串可以是单个答案字符串，也可以是由半角逗号“,”分隔的多个答案字符串。
2.1.1.3 在2.1.1.1约定的情况下，当且仅当学生作答与2.1.1.2中约定的任意一个答案字符串严格相等时，返回逻辑值True，求解值1；否则返回逻辑值False，求解值0，如例3。
例3 完全精确匹配规则
规则	学生作答	返回值
{
"type": "EM",
"desc": "大于,>"
}	大于	[True, 1]
	>	[True, 1]
	大于等于	[False, 0]
	不大于	[False, 0]
2.1.2 子串精确匹配规则 SM
2.1.2.1 规则类型（type）设定为SM时，表示该原子单元是一个字串精确匹配规则单元。 
2.1.2.2 在2.1.2.1约定的情况下，规则描述（desc）必须是一个字符串。字符串可以是单个答案字符串，也可以是由半角逗号“,”分隔的多个答案字符串。
2.1.2.3 在2.1.2.1约定的情况下，对于每个答案字符串，当且仅当学生作答包含其内容时，记命中规则1次（值增加1），如例4。
2.1.2.4 如果答案字符串包含"|"，那么这意味着此项存在多个近义词选项。如果答案中命中了这些项（该项以"|"分隔后的词汇列表）中的一个或多个，均仅记命中规则1次（值记为1）。如果近义词选项以"!"开头，那么一旦命中该词，则直接跳过本答案字符串。如果近义词选项以"~"开头，则表示需要将答案字符串中的所有该词移除后再进行其余近义词选项的匹配。
2.1.2.5 如果最终命中规则次数为0，则返回逻辑值False，求解值0；否则返回逻辑值True，求解值为命中规则次数。
例4 子串精确匹配规则
规则	学生作答	返回值
{
"type": "SM",
"desc": "爱,祖国|国家",
"slot": 0
}	我爱国，我爱祖国母亲	[True, 2]

	我国	[False, 0]
	我家	[False, 0]
	祖国祖国国家国家	[True, 1]
2.1.3 单向贴近匹配规则 OP
2.1.3.1 规则类型（type）设定为OP时，表示该原子单元是一个单向贴近匹配规则单元。 
2.1.3.2 在2.1.3.1约定的情况下，规则描述（desc）必须是一个字符串。字符串必须由一个取值范围在(0,1]之间的数值（以下用N指代）和英文冒号":"开头，其后的部分可以是单个答案字符串，也可以是由半角逗号“,”分隔的多个答案字符串。
2.1.3.3 在2.1.3.1约定的情况下，当且仅当学生作答包含与答案字符串最大单向匹配度n≥N的内容时，返回逻辑值True，求解值n，否则返回逻辑值False，求解值0，如例5。
2.1.3.4 单向贴近度计算方法：使用动态规划的方法来计算学生作答与答案字符串的最大公共子序列的长度，然后将这个长度除以答案字符串的长度来得到单向贴近度。
例5 单向贴近规则
规则	学生作答	返回值
{
"type": "OP",
"desc": "0.4:绕绕落落回",
"slot": 0
}	一二绕三四落五回	[True, 0.60]
	一号二号绕三号四号落	[True, 0.40]
	先回再落	[False, 0]
	顺序是：绕绕落落回	[True, 1.00]
2.1.4 相似度规则 CS
2.1.4.1 规则类型（type）设定为CS时，表示该原子单元是一个相似度规则单元。 
2.1.4.2 规则描述、返回情况同2.1.3.2与2.1.3.3.与之不同地，将求解“单向匹配度”变更为“求解Jaccard相似度”。
2.2 组合规则（combos）
由若干个组合单元构成，如例6。每个组合单元持有一个字母id作为键，对应的值为一个JSON单元，由组合表达式（combo）、基准分数（score）、计分模式（mode）三部分构成。
例6 基本形式示意（combos）
{
    "rules":{...},
    "combos":{
        "A":{
            "combo": "G(0,T(0)) and G(1,T(0))",
            "score": 5,
            "mode": "logic"
        },
        "B":{...}
    }
}
组合表达式（combo）、基准分数（score）、计分模式（mode）的规范性约定见3.2.1-3.2.2。
2.2.1 组合表达式（combo）
2.2.1.1 引用学生作答 对于学生作答的第n个空（以0为序号起点），规定4种算子：
T算子 T(n)表示将第n个空的原文（字符串）引入表达式；
L算子 L(n)表示将第n个空的长度（整数）引入表达式；
Q算子 Q(n)表示将第n个空的“是否为空”情况（布尔值）引入表达式；
F算子 F(n)表示将第n个空转化成数值（浮点数）引入表达式；
特别地，当n为"*"时，T('*')表示将所有空合并为一段文本进行处理，L('*')返回所有文本长度之和，Q('*')返回不为空的数量总和，F('*')返回将所有空合并为一段文本后转化的数值。
2.2.1.2 调用原子规则 利用学生作答s调用原子规则，规定2种算子：
G算子 G(K,s)表示利用id为K的原子规则计算作答s，并取逻辑值；
M算子 M(K,s)表示利用id为K的原子规则计算作答s，并取求解值；
2.2.1.3 额外逻辑处理 根据表达式f进行额外的逻辑处理，规定2种算子：
U算子 U(f,C)表示对值f取上界C并返回；
A算子 A(a,b,...)表示对任意个数的变量输入，返回值为真的数量。
X算子 X(a,b,...)表示对任意个数的变量输入，返回最大的值。
2.2.1.4 合法符号 除以上算子外，合法的符号还包括if else and or not () == >= != <= < > True False + - * / 数字。其中，if else的使用仅限A if B else C的单行表达形式。
2.2.1.5 组合表达式的求解 由2.2.1.1-2.2.1.4构建的组合表达式具有唯一确定的求解返回值，其可能是布尔类型，也可能是数值类型。
2.2.2 基准分数（score）、计分模式（mode）
2.2.2.1 基准分数（score）必须是一个数值。它表示组合计分规则生效时获得的基准分数，这项分数的具体计算方法需要与计分模式（mode）配合。
2.2.2.2 计分模式（mode）必须是一个字符串，必须为logic或value。
2.2.2.3 计分模式（mode）为logic时，表示逻辑计分规则，此时组合表达式必须返回布尔类型，如果返回True则计score对应的分数，如果返回False则计0分。
2.2.2.4 计分模式（mode）为value时，表示数值计分规则，此时组合表达式必须返回数值类型，计分为[数值*score]。
2.3 组合模式
组合模式必须为“ADD”或“MAX”。当模式为“ADD”时，题目的最终得分为组合规则中各评分规则单元计分结果的总和；当模式为“MAX”时，题目的最终得分为组合规则中各评分规则单元计分结果的最大值。特别地，小于0分的总分会被置为0分，大于10分的总分会被置为10分。
`
myPrompt = manual + '基于以上规则编制规范，直接输出$REQ$对应的JSON规则，不要输出其它内容'

function chat(req, cb) {
    console.log(req);
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('apiKey'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: localStorage.getItem('apiModel'),
            messages: [{ role: 'user', content: myPrompt.replace('$REQ$', req) }],
            stream: true
        })
    };

    fetch('https://api.siliconflow.cn/v1/chat/completions', options)
        .then(async response => {
            if (!response.ok) {
                cb({ error: `HTTP error! status: ${response.status}` });
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    cb({ done: true });
                    break;
                }

                const chunk = decoder.decode(value);
                try {
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') {
                                cb({ done: true });
                                return;
                            }
                            const parsed = JSON.parse(data);
                            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                result += parsed.choices[0].delta.content;
                                cb({ content: parsed.choices[0].delta.content, partial: result });
                            }
                        }
                    }
                } catch (err) {
                    cb({ error: err.message });
                }
            }
        })
        .catch(err => cb({ error: err.message }));
}