class Move {
	constructor({
		ele = this.throwError("ele"),	//必须传入参数【ele】，表示可移动的对象
		edgeEle = ele.parentElement		//限制移动的边界元素，可选，默认为移动元素的父级元素
	}) {
		this.ele = ele;
		this.edgeEle = edgeEle;
		this.isMove = false;	//当前是否处于可移动状态
		
		this.init();
	}
	throwError(para) {
		/*
		 * @description 抛出空参数错误
		 * @parameter {string} para 
		 */
		throw new Error("parameter " + para + " can not be empty!");
	}
	init() {
		let ele = this.ele,
			edgeEle = this.edgeEle,
			mouseDown = this.move();
		
		if (ele.parentElement !== edgeEle) {	//由于直接设置元素的left、top的值会受限于其父级元素，故当设置的边界元素不是该元素的父级元素的时候就必须更改该元素的实际DOM位置方可实现完整效果
			edgeEle.appendChild(ele);
			edgeEle.style.position = "relative";
			edgeEle = null;
		}
		
		ele.addEventListener("mousedown", (event) => {
			let e = event,
				ele = this.ele;
			
			e.stopPropagation();
			
			if (e.button === 2) {	//通过右键来添加/移除移动功能
				ele.oncontextmenu = (event) => {	//屏蔽右键菜单
					event.returnValue = false;
				};
				
				if (!this.isMove) {	//添加移动功能
					ele.addEventListener("mousedown", mouseDown, false);
					ele.style.cursor = "move";
					ele.onselectstart = () => {	//可移动状态下禁止选中功能
						return false;
					};
					this.isMove = true;
				} else {	//移除移动功能
					ele.removeEventListener("mousedown", mouseDown, false);
					ele.style.cursor = "default";
					ele.onselectstart = () => {	//不可移动状态下恢复选中功能
						return true;
					};
					this.isMove = false;
				}
				
				ele = null;
			}
		}, false);
		
		ele = null;
	}
	move() {
		const ele = this.ele,
			doc = document,
			mouseDown = (event) => {
				let e = event,
					[initXSpace, initYSpace] = [e.offsetX, e.offsetY],	//光标距离移动元素的左边、上边的距离
					edgeEle = this.edgeEle,
					[edgeEleLeftSpace, edgeEleTopSpace] = function(e, ele, edgeEle) {	//最大的左边距、上边距，以父级元素为界
						let leftSpace = 0, topSpace = 0;
						
						do {
							leftSpace += ele.offsetLeft;
							topSpace += ele.offsetTop;
							
							ele = ele.parentElement;
						} while(ele !== edgeEle)
						
						return [e.clientX - initXSpace - leftSpace, e.clientY - initYSpace - topSpace];
					}(e, ele, edgeEle),	//当前的边界元素距离浏览器可视区域的左边、上边的距离
					[maxLeft, maxTop] = [edgeEle.clientWidth - ele.clientWidth, edgeEle.clientHeight - ele.clientHeight],	//最大的左边距、上边距，以父级元素为界
					mouseMove = (event) => {
						let e = event,
							[nowX, nowY] = [e.clientX - edgeEleLeftSpace, e.clientY - edgeEleTopSpace],	//当前光标位置，计算后得到的是相对于边界元素的X、Y的值。
							[left, top] = [nowX - initXSpace, nowY - initYSpace];	//实时记录移动到的位置
						
						ele.style.left = (left > 0 ? (left > maxLeft ? maxLeft : left) : 0) + "px";	//边界限制
						ele.style.top = (top > 0 ? (top > maxTop ? maxTop : top) : 0) + "px";
						
						return false;
					};
				
				e.stopPropagation();
				
				doc.addEventListener("mousemove", mouseMove, false);
				doc.addEventListener("mouseup", () => {
					doc.removeEventListener("mousemove", mouseMove, false);
				}, false);
				
				return false;
			};
		
		return mouseDown;
	}
}