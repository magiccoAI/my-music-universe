/* eslint-disable no-restricted-globals */
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';

self.onmessage = (e) => {
  const { data, dimensions } = e.data;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const simulation = forceSimulation(data)
    .force('charge', forceManyBody().strength(20))
    .force('center', forceCenter(centerX, centerY))
    .force('collision', forceCollide().radius(d => d.size * 1.8))
    .force('x', forceX(centerX).strength(0.3))
    .force('y', forceY(centerY).strength(0.3))
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