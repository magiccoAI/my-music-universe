import * as d3 from 'd3';

self.onmessage = (e) => {
  const { data, dimensions } = e.data;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(20))
    .force('center', d3.forceCenter(centerX, centerY))
    .force('collision', d3.forceCollide().radius(d => d.size * 1.8))
    .force('x', d3.forceX(centerX).strength(0.3))
    .force('y', d3.forceY(centerY).strength(0.3))
    .stop();

  for (let i = 0; i < 200; ++i) simulation.tick();

  const layoutData = data.map((d) => ({
    ...d,
    x: d.x || centerX + (Math.random() - 0.5) * dimensions.width * 0.8,
    y: d.y || centerY + (Math.random() - 0.5) * dimensions.height * 0.8,
    rotation: 0,
    opacity: 0.9 + Math.random() * 0.1
  }));

  self.postMessage(layoutData);
};