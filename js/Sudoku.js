  
  
  Sudoku = function(size) {
	  this.size = size;
	  this.version = 'v1.0';
  };
  
  Sudoku.prototype = {
	  startTime : 0,
	  usedTime : 0,
	  gameState : 'init',
	  gameTimer : null,
	  layout : [],
	  answer : [],
	  answerPosition : [],
	  solving : [],
	  solvingStack : [],
	  mask : null,
	  numberPicker : null,
	  choosing : {
		  row : 0,
		  col : 0
	  },
  
	  // Initialization
	  init : function() {
		  this.startTime = new Date().getTime();
		  this.usedTime = 0;
  
		  for (var i = 0; i < this.size; i++) {
			  for (var j = 0; j < this.size; j++) {
				  this.layout[i * this.size + j] = 0;
				  this.solving[i * this.size + j] = 0;
				  this.answerPosition[i * this.size + j] = 0;
				  for (var h = 0; h < this.size; h++) {
					  this.answer[i * this.size * this.size + j * this.size + h] = 0;
				  }
			  }
		  }
	  },
	  // Fetch the answer of specific column.
	  getAnswer : function(row, col) {
		  for (var i = 1; i <= this.size; i++) {
			  this.answer[row * this.size * this.size + col * this.size + i - 1] = i;// Assume it includes every answer
		  }
		  // Remove the included ones.
		  for (var i = 0; i < this.size; i++) {
			  if (this.layout[i * this.size + col] != 0) {
				  this.answer[row * this.size * this.size + col * this.size
						  + this.layout[i * this.size + col] - 1] = 0;// Remove elements in the column
			  }
			  if (this.layout[row * this.size + i] != 0) {
				  this.answer[row * this.size * this.size + col * this.size
						  + this.layout[row * this.size + i] - 1] = 0;// Remove elements in this row
			  }
		  }
		  var subnum = Math.floor(Math.sqrt(this.size));
		  var x = Math.floor(row / subnum);
		  var y = Math.floor(col / subnum);
		  for (var i = x * subnum; i < subnum + x * subnum; i++) {
			  for (var j = y * subnum; j < subnum + y * subnum; j++) {
				  if (this.layout[i * this.size + j] != 0)
					  this.answer[row * this.size * this.size + col * this.size
							  + this.layout[i * this.size + j] - 1] = 0;// Remove the element in the small square.
			  }
		  }
		  this.randomAnswer(row, col);
	  },
	  // Random sort for specific column
	  randomAnswer : function(row, col) {
		  // Random sort
		  var list = [];
		  for (var i = 0; i < this.size; i++)
			  list.push(this.answer[row * this.size * this.size + col * this.size
					  + i]);
		  var rdm = 0, idx = 0;
		  while (list.length != 0) {
			  rdm = Math.floor(Math.random() * list.length);
			  this.answer[row * this.size * this.size + col * this.size + idx] = list[rdm];
			  list.splice(rdm, 1);
			  idx++;
		  }
	  },
	  // Calculate the answers of specific row or column.
	  getAnswerCount : function(row, col) {
		  var count = 0;
		  for (var i = 0; i < this.size; i++)
			  if (this.answer[row * this.size * this.size + col * this.size + i] != 0)
				  count++;
		  return count;
	  },
	  // Return the answer of specific row/col
	  getAnswerNum : function(row, col, ansPos) {
		  var cnt = 0;
		  for (var i = 0; i < this.size; i++) {
			  // Find answer in specific position and return
			  if (cnt == ansPos
					  && this.answer[row * this.size * this.size + col
							  * this.size + i] != 0)
				  return this.answer[row * this.size * this.size + col
						  * this.size + i];
			  if (this.answer[row * this.size * this.size + col * this.size + i] != 0)
				  cnt++;// If it's the answer, renew the counter.
		  }
		  return 0;// Didn't find
	  },
	  // Generate layout of the game.
	  generate : function() {
		  this.init(this.size);
		  var curRow = 0, curCol = 0;
		  while (curRow != this.size) {
			  if (this.answerPosition[curRow * this.size + curCol] == 0)
				  this.getAnswer(curRow, curCol);// If the position didn't be recurred, then we don't need to recalculate.
			  var ansCount = this.getAnswerCount(curRow, curCol);
			  if (ansCount == this.answerPosition[curRow * this.size + curCol]
					  && curRow == 0 && curCol == 0)
				  break;// Finish backtrack
			  if (ansCount == 0) {
				  this.answerPosition[curRow * this.size + curCol] = 0;// No available answer
				  if (curCol > 0) {
					  curCol--;
				  } else if (curCol == 0) {
					  curCol = 8;
					  curRow--;
				  }
				  this.layout[curRow * this.size + curCol] = 0;
				  continue;
			  }
			  // Used up the available answer
			  else if (this.answerPosition[curRow * this.size + curCol] == ansCount) {
				  this.answerPosition[curRow * this.size + curCol] = 0;
				  if (curCol > 0) {
					  curCol--;
				  } else if (curCol == 0) {
					  curCol = 8;
					  curRow--;
				  }
				  this.layout[curRow * this.size + curCol] = 0;
				  continue;
			  } else {
				  // Return the specific pos of the answer
				  this.layout[curRow * this.size + curCol] = this.getAnswerNum(
						  curRow, curCol, this.answerPosition[curRow * this.size
								  + curCol]);
				  this.answerPosition[curRow * this.size + curCol]++;
				  if (curCol == 8) {
					  curCol = 0;
					  curRow++;
				  } else if (curCol < 8) {
					  curCol++;
				  }
			  }
		  }
	  },
	  get : function(id) {
		  return document.getElementById(id);
	  },
	  // Get the event object. For IE and Firefox
	  getEvent : function() {
		  return window.event || arguments.callee.caller.arguments[0];
	  },
	  getMousePosition : function(e) {
		  var x = e.x || e.pageX;
		  var y = e.y || e.pageY;
		  return {
			  x : x,
			  y : y
		  };
	  },
	  // Init Layout
	  initLayout : function() {
		  var self = this;
		  
		  // Choose difficulty
		  var level = "<input type='radio' name='level' checked>Easy<br/>"
				  + "<input type='radio' name='level'>Mid<br/>"
				  + "<input type='radio' name='level'>Hard<br/>"
				  + "<input type='radio' name='level'>Expert<br/><br/>";
		  var time = 'Time：<span id="timer" style="background:#C0C0C0;width:100%;color:red;">00:00:00</span><br/><br/>';
		  var s = document.createElement('input');
		  s.type = 'button';
		  s.value = 'Start';
		  s.className = 'btn btn-info btn-default';
		  s.onclick = function() {
			  this.value = 'Restart';
			  self.start(this.size);
		  }
		  var p = document.createElement('input');
		  p.type = 'button';
		  p.setAttribute('id', 'pause');
		  p.value = 'Pause';
		  p.className = 'btn btn-info btn-default';
		  p.onclick = function() {
			  if (self.gameState != 'init') {
				  if (p.value == 'Pause') {
					  p.value = 'Resume';
					  self.gameState = 'pause';
				  } else {
					  p.value = 'Pause';
					  self.gameState = 'continue';
				  }
				  self.pause();
			  }
		  }
  
		  // WestPanel:
		  var westPanel = document.createElement('div');
		  westPanel.className = 'westPanel';
		  westPanel.innerHTML = '<br/><br/><br/>'
				  + '<font size="4">Difficulty：<br/><br/>' + level + time + '</font>';
		  westPanel.appendChild(s);
		  westPanel.appendChild(p);
		  document.body.appendChild(westPanel);
  
		  // Central panel
		  var mp = document.createElement('div');
		  mp.setAttribute('id', 'mp');
		  mp.className = 'mainPanel';
		  document.body.appendChild(mp);
  
		  this.mask = document.createElement('div');
		  this.mask.className = 'mask';
  
  
		  // Number picker
		  this.numberPicker = document.createElement('div');
		  this.numberPicker.setAttribute('id', 'numberPicker');
		  this.numberPicker.className = 'numberPicker';
  
		  var title = document.createElement('div');
		  title.style.cssText = 'position:absolute;left:15%;center:0;top:0;width:75%;'
				  + 'height:5%;text-align:right;color:#000000;';
		  title.innerHTML = 'Pick answer';
		  this.numberPicker.appendChild(title);
  
		  var closeBtn = document.createElement('div');
		  closeBtn.style.cssText = 'position:absolute;center:0;top:2;width:20;height:18;'
				  + 'cursor:pointer;cursor:hand;alignment:right;color:pink;background:url(images/close.gif) no-repeat;';
		  closeBtn.onclick = function() {
			  document.body.removeChild(self.numberPicker);
		  }
		  this.numberPicker.appendChild(closeBtn);
		  for (var i = 0; i < this.size; i++) {
			  var numi = document.createElement('div');
			  numi.setAttribute('id', 'picker_' + (i + 1));
			  numi.innerHTML = i + 1;
			  numi.style.cssText = "position:absolute;text-align:center;font-size:28;left:"
					  + (i % 3)
					  * 40
					  + "px;top:"
					  + ((Math.floor(i / 3)) * 40 + 18)
					  + "px;width:40px;height:40px;border:2px solid #C0C0C0;cursor:pointer;";
  
			  numi.onclick = function() {
				  self.choose(this.id);
				  this.style.background = '#FF9999';
				  document.body.removeChild(self.numberPicker);
			  }
			  numi.onmouseover = function() {
				  this.style.background = '#FF9999';
			  }
			  numi.onmouseout = function() {
				  this.style.background = '#FFFFFF';
			  }
			  this.numberPicker.appendChild(numi);
		  }
  
		  // Game layout
		  var w = mp.clientWidth / this.size;
		  var h = (mp.clientHeight - 50) / this.size;
  
		  for (var i = 0; i < this.size; i++) {
			  for (var j = 0; j < this.size; j++) {
				  var cell = document.createElement('div');
				  cell.setAttribute('id', 'cell_' + i + '_' + j);
				  cell.style.cssText = "position:absolute;left:" + j * w
						  + "px;top:" + i * h + "px;width:" + w + "px;height:"
						  + h + "px;border:2px solid #666;";
				  var subSize = Math.floor(Math.sqrt(this.size));
				  var r = Math.floor(i / subSize);
				  var c = Math.floor(j / subSize);
				  if (r % 2 == c % 2) {
					  cell.style.background = '#FF9999';
				  }
				  mp.appendChild(cell);
			  }
		  }
		  this.stopSolving();
  
		  /* Control btns: */
		  // Finish btn:
		  var finish = document.createElement('input');
		  finish.type = 'button';
		  finish.value = 'Finish';
		  finish.className = 'btn btn-info btn-default';
		  finish.onclick = function() {
			  self.checkAnswer();
		  }
  
		  // Reset btn:
		  var reset = document.createElement('input');
		  reset.type = 'button';
		  reset.value = 'Reset';
		  reset.className = 'btn btn-info btn-default';
		  reset.onclick = function() {
			  self.reset();
		  }
  
		  // Btn panel
		  var btnPanel = document.createElement('div');
		  btnPanel.setAttribute('id', 'btnPanel');
		  btnPanel.className = 'btnPanel bg-info';
		  btnPanel.appendChild(finish);
		  btnPanel.appendChild(reset);
  
		  mp.appendChild(btnPanel);
	  },
	  
	  
	  // bg twinkle:
	  twinkle : function(el, oldColor, newColor) {
		  var i = 0;
		  var t = setInterval(function() {
			  if (i < 7) {
				  if (i % 2 == 1) {
					  el.style.background = newColor;
				  } else {
					  el.style.background = oldColor;
				  }
				  i++;
			  } else {
				  clearInterval(t);
			  }
		  }, 200);
	  },
	  // Check the number of user chose.
	  choose : function(id) {
		  var c = id.split('_')[1];
		  var t = this.get('cell_' + this.choosing.row + '_' + this.choosing.col);
		  var previous = t.innerHTML;
		  t.innerHTML = c;
		  this.solvingStack
				  .push([this.choosing.row, this.choosing.col, previous]);
  
		  this.onSelect(c, this.choosing.row, this.choosing.col);
	  },
	  // Check the answer.
	  checkAnswer : function() {
		  var flag = true;
  
		  for (var i = 0; i < this.size; i++) {
			  for (var j = 0; j < this.size; j++) {
				  if (this.solving[i * this.size + j] != this.layout[i
						  * this.size + j]) {
					  flag = false;
					  var cell = this.get('cell_' + i + '_' + j);
					  this.twinkle(cell, cell.style.background, '#CC99FF');
					  // alert('请在第' + (i + 1) + '行，' + (j + 1) + '列填上你的答案！');
					  break;
				  }
			  }
			  if (!flag)
				  break;
		  }
  
		  if (flag && this.gameState != 'init') {
			  var t = Math.floor((new Date().getTime() - this.startTime) / 1000);
			  clearInterval(this.gameTimer);
			  var c = confirm('Congratulations！ You won!\nTime：'
					  + this.changeTimeToString(t + this.usedTime) + '\nRestart？');
			  if (c) {
				  this.start();
			  } else {
				  this.get('timer').innerHTML = '00:00:00';
			  }
		  }
	  },
	  // To check whether only one answer of the layout.
	  checkUnique : function() {
		  var res = [];
		  for (var r1 = 0; r1 < this.size - 1; r1++) {
			  for (var r2 = r1 + 1; r2 < this.size; r2++) {
				  for (var c1 = 0; c1 < this.size - 1; c1++) {
					  for (var c2 = c1 + 1; c2 < this.size; c2++) {
						  if (this.layout[r1 * this.size + c1] == this.layout[r2
								  * this.size + c2]
								  && this.layout[r1 * this.size + c2] == this.layout[r2
										  * this.size + c1]) {
							  res.push([r1, r2, c1, c2]);
						  }
					  }
				  }
			  }
		  }
		  return res;
	  },
	  // Start the game
	  start : function() {
		  // Restart the game.
		  this.restart();
  
		  // Remove the mask.
		  if (this.gameState == 'init' || this.gameState == 'pause')
			  this.continueSolving();
  
		  // Get the status of the current game.
		  if (this.gameState == 'continue' || this.gameState == 'start') {
			  clearInterval(this.gameTimer);
		  } else {
			  this.get('pause').value = 'Pause';
		  }
		  // Change the game status
		  this.gameState = 'start';
  
		  var self = this;
  
		  // Start to calculate the time
		  this.startTime = new Date().getTime();
		  var timer = this.get('timer');
		  this.gameTimer = setInterval(function() {
			  var time = Math.floor((new Date().getTime() - self.startTime)
					  / 1000);
			  timer.innerHTML = self.changeTimeToString(time);
		  }, 1000);
	  },
	  // Restart the game:
	  restart : function() {
		  // Generate the layout
		  this.generate(this.size);
		  // Get the difficulty level.
		  var checkedIndex = this.getLevel();
		  var self = this;
  
		  for (var i = 0; i < this.size; i++) {
			  for (var j = 0; j < this.size; j++) {
				  var cell = this.get('cell_' + i + '_' + j);
				  cell.style.borderColor = '#c0c0c0';
				  cell.innerHTML = '';
  
				  var rdm = Math.floor(Math.random() * 6);
				  if (rdm > checkedIndex) {
					  cell.innerHTML = this.layout[i * this.size + j];
					  this.solving[i * this.size + j] = this.layout[i * this.size
							  + j];
				  } else {
					  cell.style.borderColor = '#E6E600';
					  // Change the bg color of the same col and row when we get the cell.
					  cell.onmouseover = function() {
						  self.onMouseOver(this.id);
					  }
					  // Remove the color.
					  cell.onmouseout = function() {
						  self.onMouseOut(this.id);
					  }
					  // When click, open the number picker window.
					  cell.onclick = function(e) {
						  // Store the current available answers
						  var rc = this.id.split('_');
						  self.choosing.row = Number(rc[1]);
						  self.choosing.col = Number(rc[2]);
  
						  var np = self.numberPicker;
						  var pos = self.getMousePosition(self.getEvent());
						  np.style.left = pos.x;
						  np.style.top = pos.y;
						  document.body.appendChild(np);
					  }
				  }
			  }
		  }
  
		  // Deal with possible multiple answers
		  var isUnique = this.checkUnique();
		  for (i = 0; i < isUnique.length; i++) {
			  var r1 = isUnique[i][0];
			  var r2 = isUnique[i][1];
			  var c1 = isUnique[i][2];
			  var c2 = isUnique[i][3];
			  // If the multiple answer cells are empty
			  if (this.solving[r1 * this.size + c1] == 0
					  && this.solving[r1 * this.size + c2] == 0
					  && this.solving[r2 * this.size + c1] == 0
					  && this.solving[r2 * this.size + c2] == 0) {
				  // Randomly choose one from the four and input it.
				  var rdm = Math.floor(Math.random() * 4);
				  var r = isUnique[i][Math.floor(rdm / 2)];
				  var c = isUnique[i][rdm % 2 + 2];
				  var cell = this.get('cell_' + r + '_' + c);
				  cell.innerHTML = this.layout[r * this.size + c];
				  this.solving[r * this.size + c] = this.layout[r * this.size + c];
			  }
		  }
	  },
	  // Mouse in:
	  onMouseOver : function(id) {
		  var o = id.split('_');
		  var i = Number(o[1]);
		  var j = Number(o[2]);
		  for (var h = 0; h < this.size; h++) {
			  if (h != i) {
				  this.get('cell_' + h + '_' + j).style.background = '#FFFFFF';// 所在列变色
			  }
			  if (h != j) {
				  this.get('cell_' + i + '_' + h).style.background = '#FFFFFF';// 所在行变色
			  }
		  }
		  // Change the color of this cell
		  var sub = Math.floor(Math.sqrt(this.size));
		  var subRow = Math.floor(i / sub);
		  var subCol = Math.floor(j / sub);
		  for (i = subRow * sub; i < subRow * sub + sub; i++) {
			  for (j = subCol * sub; j < subCol * sub + sub; j++) {
				  this.get('cell_' + i + '_' + j).style.background = '#FFFFFF';
			  }
		  }
	  },
	  // Mouse out:
	  onMouseOut : function(id) {
		  var o = id.split('_');
		  var i = Number(o[1]);
		  var j = Number(o[2]);
  
		  var subSize = Math.floor(Math.sqrt(this.size));
		  var r = Math.floor(i / subSize);
		  var c = Math.floor(j / subSize);
		  for (var h = 0; h < this.size; h++) {
			  var sh = Math.floor(h / subSize);
			  if (h != i) {
				  if (sh % 2 == c % 2) {
					  this.get('cell_' + h + '_' + j).style.background = '#FF9999';
				  } else {
					  this.get('cell_' + h + '_' + j).style.background = '#FFFFFF';
				  }// Change back to the original color in this column
			  }
			  if (h != j) {
				  if (sh % 2 == r % 2) {
					  this.get('cell_' + i + '_' + h).style.background = '#FF9999';
				  } else {
					  this.get('cell_' + i + '_' + h).style.background = '#FFFFFF';
				  }// Change back to the original color in this row
			  }
		  }
		  // Change the color of the current cell:
		  var bgColor = (c % 2 == r % 2) ? '#FF9999' : '#FFFFFF';
		  var sub = Math.floor(Math.sqrt(this.size));
		  var subRow = Math.floor(i / sub);
		  var subCol = Math.floor(j / sub);
		  for (i = subRow * sub; i < subRow * sub + sub; i++) {
			  for (j = subCol * sub; j < subCol * sub + sub; j++) {
				  this.get('cell_' + i + '_' + j).style.background = bgColor;
			  }
		  }
	  },
	  // When we input the answer, check whether we have conflict.
	  onSelect : function(v, i, j) {
		  var cp = this.getCheckingPosition(i, j);
  
		  var flag = true;
		  for (var h = 0; h < cp.length; h++) {
			  var r = cp[h][0];
			  var c = cp[h][1];
			  if (this.solving[r * this.size + c] == v) {
				  // alert('v=' + v + '(i,j)=(' + r + ',' + c + ')')
				  flag = false;
				  // Mark the conflict one.
				  this.get('cell_' + r + '_' + c).style.background = '#CC99FF';
			  }
		  }
		  // No conflict:
		  // if (flag)
		  this.solving[i * this.size + j] = v;
	  },
	  // Get the number of col & row of the current cell and whole cell.
	  getCheckingPosition : function(i, j) {
		  var res = [];
		  for (var h = 0; h < this.size; h++) {
			  if (h != i)
				  res.push([h, j])
			  if (h != j)
				  res.push([i, h]);
		  }
		  var sub = Math.floor(Math.sqrt(this.size));
		  var subRow = Math.floor(i / sub);
		  var subCol = Math.floor(j / sub);
		  for (var x = subRow * sub; x < subRow * sub + sub; x++) {
			  for (var y = subCol * sub; y < subCol * sub + sub; y++) {
				  if (x != i || y != j) {
					  res.push([x, y]);
				  }
			  }
		  }
  
		  return res;
	  },
	  // Pause or resume the game.
	  pause : function() {
		  // After resume, recalculate the time
		  if (this.gameState == 'continue') {
			  this.continueSolving();
  
			  this.startTime = new Date().getTime();
			  var self = this;
			  this.gameTimer = setInterval(function() {
				  var time = Math.floor(self.usedTime
						  + (new Date().getTime() - self.startTime) / 1000);
				  timer.innerHTML = self.changeTimeToString(time);
			  }, 1000);
		  }
		  // When we click pause, record the time.
		  else {
			  clearInterval(this.gameTimer);
			  var t = Math.floor((new Date().getTime() - this.startTime) / 1000);
			  this.usedTime += t;
			  this.stopSolving();
		  }
	  },
	  // Can't input answers when the game is pausing.
	  stopSolving : function() {
		  document.body.appendChild(this.mask);
	  },
	  // Resume and remove the mask.
	  continueSolving : function() {
		  document.body.removeChild(this.mask);
	  },
	  // Fetch the difficulty of the game.
	  getLevel : function() {
		  var l = document.getElementsByName('level');
		  for (var i = 0; i < l.length; i++) {
			  if (l[i].checked) {
				  return i + 1;
			  }
		  }
	  },
	  // Reset the answer.
	  reset : function() {
		  // for (var i = 0; i < this.solvingStack.length; i++) {
		  if (this.solvingStack.length > 0) {
			  var ss = this.solvingStack.pop();
			  this.solving[ss[0] * this.size + ss[1]] = ss[2];
			  this.get('cell_' + ss[0] + '_' + ss[1]).innerHTML = ss[2];
		  }
		  // }
	  },
	  // Change the time vacancy to string
	  changeTimeToString : function(time) {
		  var res = '';
		  var h = Math.floor(time / 3600);
		  if (h < 10) {
			  h = '0' + h;
		  }
		  var m = time % 3600;
		  m = Math.floor(m / 60);
		  if (m < 10) {
			  m = '0' + m;
		  }
		  var s = time % 60;
		  if (s < 10) {
			  s = '0' + s;
		  }
  
		  res = h + ':' + m + ':' + s;
		  return res;
	  }
  };
  
  window.onload = function() {
	  var sudoku = new Sudoku(9);
	  sudoku.initLayout();
  }
