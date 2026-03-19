'use client';

import { useState, useEffect, useRef } from 'react';

interface KnowledgeNode {
  id: string;
  label: string;
  group: 'concept' | 'topic' | 'plan';
  x?: number;
  y?: number;
}

interface KnowledgeLink {
  source: string;
  target: string;
  strength: number;
}

export default function KnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([
    { id: '1', label: '人生规划', group: 'topic' },
    { id: '2', label: '目标设定', group: 'concept' },
    { id: '3', label: '时间管理', group: 'concept' },
    { id: '4', label: '学习方法', group: 'topic' },
    { id: '5', label: '知识内化', group: 'concept' },
    { id: '6', label: '职业发展', group: 'plan' },
    { id: '7', label: '个人成长', group: 'plan' },
    { id: '8', label: '跨领域学习', group: 'concept' },
  ]);

  const [links, setLinks] = useState<KnowledgeLink[]>([
    { source: '1', target: '2', strength: 0.9 },
    { source: '1', target: '3', strength: 0.8 },
    { source: '1', target: '6', strength: 0.7 },
    { source: '4', target: '5', strength: 0.9 },
    { source: '4', target: '8', strength: 0.8 },
    { source: '6', target: '7', strength: 0.6 },
    { source: '2', target: '7', strength: 0.5 },
    { source: '3', target: '6', strength: 0.4 },
  ]);

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机更新一些节点的位置（模拟动态图）
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          x: Math.random() * 500,
          y: Math.random() * 300,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 绘制知识图谱
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制连线
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);

      if (!sourceNode?.x || !sourceNode?.y || !targetNode?.x || !targetNode?.y) return;

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);

      // 根据连接强度设置线条粗细和透明度
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + link.strength * 0.5})`;
      ctx.lineWidth = 1 + link.strength * 2;
      ctx.stroke();
    });

    // 绘制节点
    nodes.forEach(node => {
      if (!node.x || !node.y) {
        node.x = Math.random() * (canvas.width - 80) + 40;
        node.y = Math.random() * (canvas.height - 80) + 40;
      }

      // 根据分组设置颜色
      let color;
      let radius;
      switch (node.group) {
        case 'topic':
          color = '#3b82f6'; // 蓝色
          radius = 25;
          break;
        case 'concept':
          color = '#8b5cf6'; // 紫色
          radius = 20;
          break;
        case 'plan':
          color = '#10b981'; // 绿色
          radius = 22;
          break;
        default:
          color = '#6b7280';
          radius = 20;
      }

      // 绘制节点圆
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // 绘制白色边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 根据标签长度调整字体大小
      const maxWidth = radius * 1.8;
      let fontSize = 12;
      ctx.font = `${fontSize}px sans-serif`;
      let textWidth = ctx.measureText(node.label).width;

      while (textWidth > maxWidth && fontSize > 8) {
        fontSize -= 1;
        ctx.font = `${fontSize}px sans-serif`;
        textWidth = ctx.measureText(node.label).width;
      }

      ctx.fillText(node.label, node.x, node.y);
    });
  }, [nodes, links]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-gray-700">主题</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span className="text-gray-700">概念</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-700">规划</span>
        </div>
      </div>
    </div>
  );
}