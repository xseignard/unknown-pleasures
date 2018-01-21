import C2S from 'canvas2svg';
import dat from 'dat.gui/build/dat.gui';

import './styles/index.css';

const gui = new dat.GUI();
const obj = { type: 'noisy' };

const container = document.querySelector('.container');
const paper = document.querySelector('#paper');

const ctx = new C2S(800, 600);
// const ctx = paper.getContext('2d');
ctx.lineWidth = 0.1;
ctx.fillStyle = '#000';
ctx.strokeStyle = '#fff';

const xOffset = { min: 200, max: 600 };
const yOffset = { min: 100, max: 500 };

const lines = 80;
const points = 100;

const dx = (xOffset.max - xOffset.min) / points;
const dy = (yOffset.max - yOffset.min) / lines;
const mx = (xOffset.min + xOffset.max) / 2;

const rand = (min, max) => {
	return Math.random() * (max - min) + min;
};

const randInt = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randNormal = (mu, sigma) => {
	let sum = 0;
	for (let i = 0; i < 6; i += 1) {
		sum += rand(-1, 1);
	}
	const norm = sum / 6;
	return mu + sigma * norm;
};

const normalPDF = (x, mu, sigma) => {
	const sigma2 = Math.pow(sigma, 2);
	const numerator = Math.exp(-Math.pow(x - mu, 2) / (2 * sigma2));
	const denominator = Math.sqrt(2 * Math.PI * sigma2);
	return numerator / denominator;
};

const getY = (type, y) => {
	switch (type) {
		case 'rounded':
			return;
			break;
		default:
	}
};

const draw = () => {
	let x = xOffset.min;
	let y = yOffset.min;
	ctx.fillRect(0, 0, 800, 600);
	ctx.moveTo(x, y);
	for (let i = 0; i < lines; i++) {
		ctx.beginPath();
		const modes = randInt(1, 4);
		const mus = [];
		const sigmas = [];
		const mu = randNormal(mx, 50);
		const sigma = randNormal(30, 30);
		for (let j = 0; j < modes; j++) {
			mus[j] = randNormal(mx, 100);
			sigmas[j] = randNormal(24, 30);
		}
		let prevY = y;
		for (let k = 0; k < points; k++) {
			x += dx;
			let noise = 0;
			for (let l = 0; l < modes; l++) {
				noise += normalPDF(x, mus[l], sigmas[l]);
			}
			let newY;
			switch (obj.type) {
				case 'rounded':
				default:
					newY = y - 1000 * normalPDF(x, mu, sigma);
					break;
				case 'noisy rounded':
					newY = y - 1000 * noise;
					break;
				case 'noisy':
					newY =
						0.3 * prevY +
						0.7 * (y - 600 * noise + noise * Math.random() * 200 + Math.random());
					break;
			}
			ctx.lineTo(x, newY);
			prevY = newY;
		}
		ctx.fill();
		ctx.stroke();
		x = xOffset.min;
		y += dy;
		ctx.moveTo(x, y);
	}
	container.appendChild(ctx.getSvg());
};

draw();

const download = () => {
	const element = document.createElement('a');
	element.setAttribute('href', `data:image/svg+xml;charset=utf-8,${ctx.getSerializedSvg()}`);
	element.setAttribute('download', 'harmonograph.svg');
	element.style.display = 'none';
	document.body.appendChild(element);
	setTimeout(() => {
		element.click();
		setTimeout(() => {
			document.body.removeChild(element);
		}, 100);
	}, 100);
};

obj.redraw = draw;
obj.download = download;

gui.add(obj, 'redraw');
gui.add(obj, 'download');
gui.add(obj, 'type', ['rounded', 'noisy rounded', 'noisy']);
gui.addColor(ctx, 'fillStyle');
gui.addColor(ctx, 'strokeStyle');

window.addEventListener('keydown', e => {
	if (e.keyCode === 82) draw();
});
