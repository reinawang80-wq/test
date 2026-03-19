import { NextResponse } from 'next/server';

// AI生成的人生规划响应接口
interface GeneratedPlan {
  oneYearPlan: {
    goals: string[];
    milestones: string[];
    todos: string[];
  };
  fiveYearPlan: {
    goals: string[];
    milestones: string[];
  };
  tenYearPlan: {
    vision: string;
    goals: string[];
  };
  explanation: string;
}

// 模拟AI生成函数 - 根据关键词生成结构化规划
function generatePlanFromKeyword(keyword: string): GeneratedPlan {
  // 关键词分类和模板
  const templates: Record<string, GeneratedPlan> = {
    '成为自由职业者': {
      oneYearPlan: {
        goals: ['建立个人品牌', '确定服务方向', '积累初始客户'],
        milestones: ['完成个人网站建设', '获得前3个付费客户', '建立稳定的工作流程'],
        todos: ['注册个人工作室', '制定服务价格表', '创建作品集', '加入自由职业平台']
      },
      fiveYearPlan: {
        goals: ['建立稳定的客户群', '年收入达到目标', '拓展服务领域'],
        milestones: ['客户数量超过50个', '建立团队支持', '开发标准化服务流程']
      },
      tenYearPlan: {
        vision: '成为行业知名的自由职业专家，拥有成熟的业务模式和团队',
        goals: ['建立个人培训体系', '出版相关书籍', '举办行业分享会']
      },
      explanation: '基于斯坦福人生设计理念，将"成为自由职业者"拆解为从建立基础到专业发展的渐进路径。'
    },
    '学习AI': {
      oneYearPlan: {
        goals: ['掌握AI基础知识', '完成实践项目', '建立学习体系'],
        milestones: ['完成在线课程学习', '参与实际项目', '获得相关认证'],
        todos: ['学习Python编程', '完成机器学习入门课程', '参加Kaggle竞赛', '阅读AI论文']
      },
      fiveYearPlan: {
        goals: ['深入专业领域', '参与行业项目', '建立技术影响力'],
        milestones: ['掌握深度学习框架', '发表技术文章', '参与开源项目']
      },
      tenYearPlan: {
        vision: '成为AI领域专家，能够解决复杂问题并推动技术发展',
        goals: ['领导AI项目团队', '申请技术专利', '培养AI人才']
      },
      explanation: '基于逆算未来方法，从长远目标倒推学习路径，注重理论与实践结合。'
    },
    '健康生活': {
      oneYearPlan: {
        goals: ['建立健康习惯', '改善身体状况', '提升生活质量'],
        milestones: ['坚持运动3个月', '改善饮食结构', '建立规律作息'],
        todos: ['每周运动3次', '学习营养知识', '定期体检', '记录健康数据']
      },
      fiveYearPlan: {
        goals: ['形成健康生活方式', '达到理想体重', '提升身体机能'],
        milestones: ['完成半程马拉松', '掌握多种运动技能', '建立健康社交圈']
      },
      tenYearPlan: {
        vision: '拥有全面健康的生活状态，成为身心健康的生活榜样',
        goals: ['维持理想健康指标', '影响家人朋友健康', '参与健康公益活动']
      },
      explanation: '从生活习惯、运动、饮食、心理等多维度构建可持续的健康生活方式。'
    },
    '创业': {
      oneYearPlan: {
        goals: ['验证商业模式', '组建核心团队', '开发产品原型'],
        milestones: ['完成市场调研', '获得种子投资', '产品MVP上线'],
        todos: ['撰写商业计划书', '寻找联合创始人', '参加创业比赛', '用户访谈']
      },
      fiveYearPlan: {
        goals: ['实现盈利', '扩大市场规模', '建立品牌影响力'],
        milestones: ['用户数突破10万', '完成A轮融资', '建立核心竞争优势']
      },
      tenYearPlan: {
        vision: '成为行业领先的企业，对社会产生积极影响',
        goals: ['公司上市或并购', '拓展国际市场', '建立企业社会责任体系']
      },
      explanation: '基于精益创业和设计思维，将创业目标拆解为可执行、可验证的阶段。'
    }
  };

  // 检查是否有匹配的模板
  const lowerKeyword = keyword.toLowerCase();
  for (const [templateKeyword, template] of Object.entries(templates)) {
    if (lowerKeyword.includes(templateKeyword.toLowerCase()) || templateKeyword.toLowerCase().includes(lowerKeyword)) {
      return template;
    }
  }

  // 默认模板 - 通用规划
  return {
    oneYearPlan: {
      goals: [`开始${keyword}的探索之旅`, '建立基础知识体系', '完成初步实践'],
      milestones: ['明确具体方向', '建立学习/实践计划', '获得初步成果'],
      todos: ['研究相关领域', '制定详细计划', '寻找学习资源', '开始第一步行动']
    },
    fiveYearPlan: {
      goals: [`在${keyword}领域建立专业能力`, '积累实践经验', '建立个人影响力'],
      milestones: ['成为该领域的熟练者', '完成重要项目', '获得行业认可']
    },
    tenYearPlan: {
      vision: `在${keyword}领域成为专家，实现个人价值和社会贡献`,
      goals: ['达到专业顶尖水平', '创造重要价值', '影响他人成长']
    },
    explanation: `基于斯坦福人生设计和逆算未来理念，将"${keyword}"拆解为可执行的长期规划。`
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { code: 400, message: '请输入有效的关键词' },
        { status: 400 }
      );
    }

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const generatedPlan = generatePlanFromKeyword(keyword.trim());

    return NextResponse.json({
      code: 0,
      data: {
        keyword: keyword.trim(),
        plan: generatedPlan,
        generatedAt: new Date().toISOString()
      },
      message: '规划生成成功'
    });
  } catch (error) {
    console.error('AI规划生成失败:', error);
    return NextResponse.json(
      { code: 500, message: '规划生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 如果是GET请求，返回API使用说明
export async function GET() {
  return NextResponse.json({
    code: 0,
    message: 'AI规划生成API',
    usage: '发送POST请求，包含{ "keyword": "你的目标关键词" }',
    examples: ['成为自由职业者', '学习AI', '健康生活', '创业'],
    note: '当前为模拟API，实际使用时需接入DeepSeek或其他AI服务'
  });
}