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
					edgeEle = this.edgeEle,
					[extraSpacingX, extraSpacingY] = function(e, ele, edgeEle) {	//extraSpacingX：光标距离该元素的左间距 + 该元素的父级元素距离浏览器可视区域左边界的间距，extraSpacingY 同理。
						let leftSpace = 0, topSpace = 0;
						
						do {
							leftSpace += ele.offsetLeft;
							topSpace += ele.offsetTop;
							
							ele = ele.parentElement;
						} while(ele !== edgeEle)
						
						return [e.clientX - leftSpace, e.clientY - topSpace];
					}(e, ele, edgeEle),	//当前的边界元素距离浏览器可视区域的左边、上边的距离
					[maxLeft, maxTop] = [edgeEle.clientWidth - ele.clientWidth, edgeEle.clientHeight - ele.clientHeight],	//最大的左边距、上边距，以父级元素为界
					mouseMove = (event) => {
						let e = event,
							[left, top] = [e.clientX - extraSpacingX, e.clientY - extraSpacingY];	//实时记录移动到的位置，相对于父级元素的位置
						
						ele.style.left = (left > 0 ? (left > maxLeft ? maxLeft : left) : 0) + "px";	//边界限制
						ele.style.top = (top > 0 ? (top > maxTop ? maxTop : top) : 0) + "px";
						
						return false;
					};
				
				e.stopPropagation();	//阻止事件继续向上冒泡
				
				doc.addEventListener("mousemove", mouseMove, false);
				doc.addEventListener("mouseup", () => {
					doc.removeEventListener("mousemove", mouseMove, false);
				}, false);
				
				return false;
			};
		
		return mouseDown;
	}
}