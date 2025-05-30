// 创建左右两半式语言切换按钮
function createSplitLanguageSwitcher() {
    // 检查是否已存在语言切换按钮
    if (document.getElementById('split-language-switcher')) {
        return;
    }

    // 创建按钮容器
    const switcher = document.createElement('div');
    switcher.id = 'split-language-switcher';
    Object.assign(switcher.style, {
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        zIndex: '9999',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        height: '36px',
        lineHeight: '36px',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    });

    // 当前语言显示部分（左侧）
    const currentLangbox = document.createElement('div');
    currentLangbox.id = 'current-language';
    currentLangbox.textContent = '中文';
    Object.assign(currentLangbox.style, {
        padding: '0 12px',
        background: '#4a6baf',
        color: 'white',
        fontSize: '14px'
    });

    // 切换语言按钮部分（右侧）
    const switchButton = document.createElement('div');
    switchButton.id = 'switch-language-button';
    switchButton.textContent = 'EN';
    Object.assign(switchButton.style, {
        padding: '0 12px',
        background: '#f8f8f8',
        color: '#333',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    });

    // 鼠标悬停效果
    switchButton.addEventListener('mouseover', () => {
        switchButton.style.background = '#e0e0e0';
    });
    switchButton.addEventListener('mouseout', () => {
        switchButton.style.background = '#f8f8f8';
    });

    // 当前语言状态
    let isChinese = true;

    // 点击切换语言
    switchButton.addEventListener('click', () => {
        isChinese = !isChinese;
        if (isChinese) {
            currentLangbox.textContent = '中文';
            switchButton.textContent = 'EN';
            switchLang('中文')
            localStorage.setItem('lang', '中文');
        } else {
            currentLangbox.textContent = 'EN';
            switchButton.textContent = '中文';
            switchLang('EN')
            localStorage.setItem('lang', 'EN');
        }
    });

    // 将两部分添加到容器
    switcher.appendChild(currentLangbox);
    switcher.appendChild(switchButton);

    // 将容器添加到body
    document.body.appendChild(switcher);
    switchButton.textContent = currentLang === '中文' ? 'EN' : '中文';
    currentLangbox.textContent = currentLang;
}

// 页面加载完成后创建按钮
if (document.readyState === 'complete') {
    createSplitLanguageSwitcher();
} else {
    window.addEventListener('load', createSplitLanguageSwitcher);
}

var langArr = {
    'coscore': {
        '中文': '教育测验文本评价管理系统',
        'EN': 'CoScore'
    },
    'general': {
        '中文': '管理',
        'EN': 'General'
    },
    'home': {
        '中文': ' 首页',
        'EN': ' Home'
    },
    'data': {
        '中文': ' 数据管理',
        'EN': ' Data'
    },
    'rules': {
        '中文': ' 规则管理',
        'EN': ' Rules'
    },
    'tasks': {
        '中文': ' 任务管理',
        'EN': ' Tasks'
    },
    'guide': {
        '中文': '帮助',
        'EN': "Guide"
    },
    'manual': {
        '中文': ' 使用手册',
        'EN': ' Manual'
    },
    'settings': {
        '中文': '设置',
        'EN': 'Settings'
    },
    'llm-settings': {
        '中文': ' 大模型设置',
        'EN': ' LLM Settings'
    },
    'link': {
        '中文': '链接',
        'EN': 'Link'
    },
    'github-repo': {
        '中文': ' 代码仓库',
        'EN': ' Github Repo'
    },
    'upload-and-manage-data': {
        '中文': '上传并管理数据',
        'EN': 'Upload and manage data'
    },
    'new-dataset': {
        '中文': '新建数据集',
        'EN': 'New Dataset'
    },
    'no-datasets-yet': {
        '中文': '暂无数据集',
        'EN': 'No datasets yet'
    },
    'get-started-dataset': {
        '中文': '创建新的自有数据集',
        'EN': 'Get started by uploading your first dataset'
    },
    'dataset-name': {
        '中文': '数据集名称',
        'EN': 'Dataset Name'
    },
    'dataset-description': {
        '中文': '数据集描述',
        'EN': 'Dataset Description'
    },
    'dataset-type': {
        '中文': '数据集类型',
        'EN': 'Dataset Type'
    },
    'dataset-name-place': {
        '中文': '例：数学测验',
        'EN': 'e.g. Math Problem Answers'
    },
    'paste-csv-data': {
        '中文': '粘贴 CSV 数据',
        'EN': 'Paste CSV Data'
    },
    'csv-req': {
        '中文': '首行应为表头，使用英文逗号分隔',
        'EN': 'First row should be headers. Use comma separators.'
    },
    'create-dataset': {
        '中文': '创建数据集',
        'EN': 'Create Dataset'
    },
    'cancel': {
        '中文': '取消',
        'EN': 'Cancel'
    },
    'upload-csv': {
        '中文': "或上传 CSV 文件",
        'EN': 'Or Upload CSV File'
    },
    'choose-file': {
        '中文': '选择文件',
        'EN': 'Choose a file…'
    },
    'no-file-selected': {
        '中文': '未选中文件',
        'EN': 'No File Selected'
    },
    'export': {
        '中文': '导出数据',
        'EN': 'Export'
    },
    'confirm-delete': {
        '中文': '确认删除',
        'EN': 'confirm Delete'
    },
    'delete-toast': {
        '中文': '您确认要删除 ',
        'EN': 'Are you sure you want to delete '
    },
    'undone-warn': {
        '中文': '此操作不可撤销',
        'EN': 'This action cannot be undone.'
    },
    'delete': {
        '中文': '删除',
        'EN': 'Delete'
    },
    'view': {
        '中文': '查看',
        'EN': 'View'
    },
    'welcome': {
        '中文': '欢迎使用教育测验文本评价管理系统',
        'EN': 'Welcome to CoScore!'
    },
    'step-1': {
        '中文': ' 第一步：准备数据',
        'EN': ' Step 1: Data'
    },
    'step-2': {
        '中文': ' 第二步：配置规则',
        'EN': ' Step 2: Rules'
    },
    'step-3': {
        '中文': ' 第三步：运行任务',
        'EN': ' Step 3: Tasks'
    },
    'step-1-desc': {
        '中文': '上传和管理测验数据',
        'EN': 'Upload and manage answer data'
    },
    'step-1-btn': {
        '中文': '现在开始',
        'EN': 'Get Started'
    },
    'step-2-desc': {
        '中文': '与大模型协同创建结构化、可解释的评分规则',
        'EN': 'Create scoring rules with the help of LLM'
    },
    'step-2-btn': {
        '中文': '前往配置',
        'EN': 'Create Rules'
    },
    'step-3-desc': {
        '中文': '后台运行评分任务并获取评分结果',
        'EN': 'Run scoring tasks and collect results'
    },
    'step-3-btn': {
        "中文": '查看任务',
        'EN': 'Run Tasks'
    },
    'read-manual': {
        '中文': '学习编写评分规则的最佳实践',
        'EN': 'Learn how to use CoScore effectively'
    },
    'step-4-btn': {
        '中文': '阅读手册',
        'EN': 'Read Guide'
    },
    'configure-llm': {
        '中文': '配置大模型 API KEY 和关键参数',
        'EN': 'Configure your LLM API keys and parameters'
    },
    'step-5-btn': {
        '中文': '前往配置',
        'EN': 'Configure'
    },
    'rule-prompt': {
        '中文': '规则提示词',
        'EN': 'Prompt for Rule Generation'
    },
    'rule-prompt-place': {
        '中文': '描述您想要生成的评分规则...',
        'EN': 'Describe the scoring criteria you want to generate...'
    },
    'generate-rule': {
        '中文': '生成规则',
        'EN': 'Generate Rule'
    },
    'save-rule': {
        '中文': '保存规则',
        'EN': 'Save Rule'
    },
    'generated-rule': {
        '中文': '结构化评分规则（JSON）',
        'EN': 'Generated Rule (JSON)'
    },
    'test-rule': {
        '中文': '测试规则',
        'EN': 'Test Rule'
    },
    'test-rule-place': {
        '中文': '输入您想要测试的答案...',
        'EN': 'Enter text to test the rule...'
    },
    'test-rule': {
        '中文': '测试规则',
        'EN': 'Test Rule'
    },
    'test-result': {
        '中文': '测试结果',
        'EN': 'Test Result'
    },
    'saved-rules': {
        '中文': '已保存的规则',
        'EN': 'Saved Rules'
    },
    'new-rule': {
        '中文': '新建规则',
        'EN': 'New Rule'
    },
    'no-saved-rules-yet': {
        '中文': '暂无已保存的规则',
        'EN': 'No saved rules yet'
    },
    'generate-first-rule': {
        '中文': '生成您的第一条规则',
        'EN': 'Generate your first rule to get started'
    },
    'new-task': {
        '中文': '新建任务',
        'EN': 'New Task'
    },
    'no-tasks-yet': {
        '中文': '暂无任务',
        'EN': 'No tasks yet'
    },
    'create-first-task': {
        '中文': '创建您的第一个任务',
        'EN': 'Create your first scoring task to get started'
    },
    'task-name': {
        '中文': '任务名称',
        'EN': 'Task Name'
    },
    'task-name-place': {
        '中文': '例：数学测验评分',
        'EN': 'e.g. Math Answers Scoring'
    },
    'select-dataset': {
        '中文': '选择数据集',
        'EN': 'Select Dataset'
    },
    'select-rule': {
        '中文': '选择评分规则',
        'EN': 'Select Scoring Rule'
    },
    'please-select': {
        '中文': '--请选择--',
        'EN': 'Please Select'
    },
    'run-task': {
        '中文': '运行任务',
        'EN': 'Run Task'
    },
    'close': {
        '中文': '关闭',
        'EN': 'Close'
    },
    'dataset': {
        '中文': '数据集',
        'EN': 'Dataset'
    },
    'rule': {
        '中文': '评分规则',
        'EN': 'Rule'
    },
    'status': {
        '中文': '状态',
        'EN': 'Status'
    },
    'created-at': {
        '中文': '创建时间',
        'EN': 'Created At'
    },
    'actions': {
        '中文': '操作',
        'EN': 'Actions'
    },
    'api-provider': {
        '中文': 'API 提供商',
        'EN': 'API Provider'
    },
    'model': {
        '中文': '模型',
        'EN': 'Model'
    },
    'save-settings': {
        '中文': '保存设置',
        'EN': 'Save Settings'
    },
    'enter-api-key': {
        '中文': '请输入您的 API KEY',
        'EN': 'Please enter your API KEY'
    }
}



function switchLang(lang) {
    currentLang = lang
        //所有class带有lang的元素，内容替换为langArr中对应的内容
    var langElements = document.querySelectorAll('.lang');
    langElements.forEach(function(element) {
        // 如果有data-lang
        if (element.hasAttribute('data-lang')) {
            var key = element.getAttribute('data-lang');
            // 如果里面原来有<i>标签，那么要保留
            if (element.innerHTML.includes('<i')) {
                var i = element.innerHTML.indexOf('<i');
                var j = element.innerHTML.indexOf('</i>');
                var icon = element.innerHTML.substring(i, j + 4);
                element.innerHTML = icon + langArr[key][lang];
                return;
            }
            element.textContent = langArr[key][lang];
        }
        if (element.hasAttribute('data-lang-place')) {
            var key = element.getAttribute('data-lang-place')
            element.placeholder = langArr[key][lang]
        }
    });
}

currentLang = localStorage.getItem('lang') || '中文';

document.addEventListener('DOMContentLoaded', function() {
    console.log('当前语言:', currentLang);
    switchLang(currentLang);
    
});