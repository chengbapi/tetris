$(function(){	
	
	//<-------Map类型的继承和定义
	function inheritPrototype( child, father ){
		var F = function(){};
		F.prototype = father.prototype;
		child.prototype = new F();
	}
	
	function Map( rows, cols ){
		Array.apply(this);
		this.rows = rows;
		this.cols = cols;
		
		//init Map instance
		for(var i = 0; i < rows; i++){
			this.addRow();
		}
	}
	
	inheritPrototype( Map, Array );
	Map.prototype.constructor = Map;
	
	Map.prototype.addRow = function(){
		var newRow = [];
		for( var i = 0; i < this.cols; i++ ){
			newRow.push(0);
		}
		this.push(newRow);
	}
		
	Map.prototype.wipePosition = function(position){
		var p = position;
		for(var i = 0 ; i < p.length; i++){
			var y = p[i][0],
				x = p[i][1];
			Map[y][x] = 0;
		}
	}
	
	Map.prototype.clean = function(rowNumber){
		this.splice(rowNumber,1);
		this.addRow();
		//alert(rowNumber)
	}
	
	Map.prototype.each = function(F){
		for(var i = 0; i < this.rows; i++){
			for(var j = 0; j < this.cols; j++){
				F(this[i][j],i,j,this);
			}
		}
	}
	
	Map.prototype.renew = function(){
		this.each(function(v,i,j,a){
			a[i][j] = 0;
		})
	}
	
	Map.prototype.die = function(){
		this.each(function(v,i,j,a){
			a[i][j] = 1;
		})
	}
	
	//Map类型的继承和定义------->
	
	
	//<---------游戏开始参数
    var colPerRow = 15,
    	TetrisPadding = 15,
        mainWidth = 600,
        mainHeight = 600,
        footerHeight = 40,
        divSize = mainWidth / colPerRow;
        
    //游戏开始参数----------> 
    var Game = {
    	init :function(){
    		//<---------初始化 M V
            this.M = new Map( colPerRow + 4 , colPerRow );
            this.V = new Map( colPerRow , colPerRow );
            
            for( var i = 0; i < this.V.rows; i++ ){
                for( var j = 0; j < this.V.cols; j++ ){
   
                    var odiv = $('<div></div>');
                    odiv.css({'height':divSize*0.9,'width':divSize*0.9,'margin':divSize*0.05,
                    			'left':divSize*j ,'bottom':divSize*i 
                    		});
                    this.el.append(odiv);

                    this.V[i][j] = odiv;

                }
			}
			
			this.tM = new Map( 4 , 4 );
            this.tV = new Map( 4 , 4 );
			
			for( var i = 0; i < this.tV.rows; i++ ){
                for( var j = 0; j < this.tV.cols; j++ ){
   
                    var odiv = $('<div></div>');
                    odiv.css({'height':divSize*0.9,'width':divSize*0.9,'margin':divSize*0.05,
                    			'left':divSize*j + TetrisPadding,'bottom':divSize*i + TetrisPadding
                    		});
                    $("#tips").append(odiv);

                    this.tV[i][j] = odiv;

                }
			}
			
			
            //初始化 M V --------->
            
            //<----------绑定事件
            //按钮绑定
            $("#start").click(function(){
            	//隐藏欢迎面板
            	$("#welcome").animate({top:-(mainHeight + footerHeight + TetrisPadding * 2)},500,function(){
            		Game.start();
            	})
            });
            $("#restart").click(function(){
            	$("#gameover").animate({top:(mainHeight + footerHeight + TetrisPadding * 2)},500,function(){
            		Game.start();
            	})
            })
	        
            //绑定事件---------->
    	},
        start : function(){
        	
			//<---------初始化游戏参数
			this.M.renew();
			this.score = 0;
			//初始化游戏参数 --------->
            
            //操作绑定
	       $(window).bind("keydown",this.operation);
            
            //<------------游戏开始
			this.round = new Round();
			//游戏开始------------>
            
        },
        el : $('#main'),
        operation :function operation(e){
	    	var c = Game.currentBlock;
	    	
			//alert(e.keyCode);
	    	
	        switch(e.keyCode){
	            case 37 : c.move([0,-1]);break;								//左
	            case 39 : c.move([0,1]);break;								//右
	            case 40 : if(!c.move([-1,0])){
	            		  	  Game.round.end();
	            		  }
	            		  break;											//下
	            case 38 : c.rotate();break;									//上
	            case 27 : alert('pause');break;								//暂停
	            case 17 : 
	            		while(c.move([-1,0]));
	            		Game.round.end();
	            		break;
	            															//空格
			}
	    },
        display : function(){
        	//ｍａｉｎ的渲染 	
            for(var i = 0;i < this.V.rows; i++){
                for(var j = 0;j < this.V.cols; j++){
                    var m = this.M[i][j];
                    var v = this.V[i][j];
                    if(m == 0){
                        v.attr('class','empty'); 
                    }
                    if(m == 1){
                        v.attr('class','static');
                    }
                    if(m == 2){
                        v.attr('class',blockColor[this.currentBlock.type]);
                    }
                }
            }
            //ｔｉｐｓ的渲染
            this.tM.renew();
            for(var i = 0,M = this.nextBlock.M;i < M.length; i++){
            	var My = M[i][0],
            		Mx = M[i][1];
            	this.tM[My][Mx] = 2;
            }
            for(var i = 0;i < this.tV.rows; i++){
                for(var j = 0;j < this.tV.cols; j++){
                    var m = this.tM[i][j];
                    var v = this.tV[i][j];
                    if(m == 0){
                        v.attr('class','empty'); 
                    }
                    if(m == 1){
                        v.attr('class','static');
                    }
                    if(m == 2){
                        v.attr('class',blockColor[this.nextBlock.type]);
                    }
                }
            }
            
            //ｓｔａｔｕｓ的渲染
            $("#status b").eq(0).html(this.score);
            $("#status b").eq(1).html(this.level);
            
        },
        insert : function(){
            var currentBlock = arguments[0];
            var beginPosition = parseInt((colPerRow - 4)/2);
            
            for(var i = 0; i < currentBlock.M.length; i++){
            	var m = currentBlock.M[i];
                    
                this.M[colPerRow + m[0]][beginPosition + m[1]] = 2;
                currentBlock.position.push([colPerRow + m[0],beginPosition + m[1]]);
            }
            
        },
        validate : function(position,merge){
            var p = position
            	
            for(var i = 0; i < p.length; i++){
            	var py = p[i][0],
            	    px = p[i][1];
            	//超出左右边界，将阻止
                if(px < 0 || px > this.M.cols - 1){ 
                	return false;
                }else if(py < 0 || this.M[py][px] == 1 ){
                	//遇到基座，将阻止
                	return false;
                }
            }
            
        	//无障碍
            //还原
            var c = this.currentBlock.position;
            for(var j = 0; j < p.length; j++){
                this.M[c[j][0]][c[j][1]] = 0;
            }         
            this.currentBlock.position = p;
            //重载
            for(var k = 0; k < p.length; k++){
                this.M[p[k][0]][p[k][1]] = 2;
            }     
               
            //移动成功
      		Game.display();
      		return true;
        },
        merge : function(){
        	var p = arguments[0];
        	//合并
        	for(var i = 0; i < p.length; i++){
        		this.M[p[i][0]][p[i][1]] = 1;
        	}
        	
        	//判断p[i][0]所占行是否满
        	for(var i = 0, cleanRows = 0 ; i < p.length; i++){
        		
        		var rowNumber = p[i][0] - cleanRows < 0 ? 0 : p[i][0] - cleanRows;
        		
        		var row = this.M[rowNumber];
        		var clean = true;
        		for(var j = 0; j < row.length; j++){
        			if(row[j] == 0){
        				clean = false;
        				break;
        			}
        		}
        		
        		if(clean){
        			this.M.clean(rowNumber);
        			cleanRows++;
        		}
        		
        	}
        	//返回删除的行数
        	return cleanRows;
        },
        speed : function(){
        	
        	
        	this.level = Math.floor(Game.score / 200) + 1;
        	if(this.level <= 11){
        		return 600 - (this.level - 1) * 50;
        	}else{
        		return 50;
        	}
        	
        },
        pause : function(){
        	alert('pause');
        },
        gameover : function(){
			//显示ｇａｍｅｏｖｅｒ面板
			$(window).unbind("keydown",this.operation);
			$("#gameover").animate({top:0},500);	
        }
    }
	

    function Round(){
        Game.nextBlock = new Block();
        Game.currentBlock = arguments[0] ? arguments[0] : new Block();

        Game.insert(Game.currentBlock)

        //自动向下移动
        
        this.timer = setInterval(function(){
            if(!Game.currentBlock.move([-1,0])){
	        	Game.round.end();
	        }
        },Game.speed());
        //alert('set'+this.timer)

		this.end = function(){
			clearInterval(this.timer);
			//alert("cl"+this.timer);
			
			var cleanRows = Game.merge(Game.currentBlock.position);
			var roundScore = 0;
			
			//alert(cleanRows)
			
			switch(cleanRows){
				case 0 : roundScore = 0; break;
				case 1 : roundScore = 10; break;
				case 2 : roundScore = 30; break;
				case 3 : roundScore = 60; break;
				case 4 : roundScore = 100; break;
			}
			
			Game.score += roundScore;
			
			var gameover = false;
			
			for(var i = 0, p = Game.currentBlock.position; i < p.length; i++){
				if(p[i][0] > Game.V.rows){
        			gameover = true;
        			break;
        		}
			}
			
			if(gameover){
				
				Game.M.die();
				Game.display();
				Game.gameover();
			}else{
				Game.round = new Round(Game.nextBlock);
			}
		}
    }
    
    //方块源
    var blockLib = [];
    for(var i = 0;i < 7;i++){
        blockLib.push(new Array());
    }
    //一形 block[0]
        blockLib[0][0] = blockLib[0][2] = [[1,0],[1,1],[1,2],[1,3]];
        blockLib[0][1] = blockLib[0][3] = [[0,1],[1,1],[2,1],[3,1]];
    //山形 block[1]
        blockLib[1][0] = [[1,0],[1,1],[1,2],[2,1]];
        blockLib[1][1] = [[0,1],[1,1],[1,2],[2,1]];
        blockLib[1][2] = [[0,1],[1,0],[1,1],[1,2]];
        blockLib[1][3] = [[0,1],[1,0],[1,1],[2,1]];
    //L 形 block[2]
        blockLib[2][0] = [[0,1],[0,2],[1,1],[2,1]];
        blockLib[2][1] = [[0,0],[1,0],[1,1],[1,2]];
        blockLib[2][2] = [[0,1],[1,1],[2,0],[2,1]];
        blockLib[2][3] = [[1,0],[1,1],[1,2],[2,2]];
    //xl形 block[3]
        blockLib[3][0] = [[0,0],[0,1],[1,1],[2,1]];
        blockLib[3][1] = [[0,2],[1,0],[1,1],[1,2]];
        blockLib[3][2] = [[0,1],[1,1],[2,1],[2,2]];
        blockLib[3][3] = [[1,0],[1,1],[1,2],[2,0]];
    //z形  block[4]
        blockLib[4][0] = blockLib[4][2] = [[1,1],[1,2],[2,0],[2,1]];
        blockLib[4][1] = blockLib[4][3] = [[0,1],[1,1],[1,2],[2,2]];
    //xz形 block[5]
        blockLib[5][0] = blockLib[5][2] = [[1,0],[1,1],[2,1],[2,2]];
        blockLib[5][1] = blockLib[5][3] = [[0,1],[1,0],[1,1],[2,0]];
    //田形 block[6]
        blockLib[6][0] = blockLib[6][1] = blockLib[6][2] = blockLib[6][3] = [[0,1],[0,2],[1,1],[1,2]];
        
    var blockColor = ['a','b','c','d','e','f','g'];
    
    function Block(){
        this.type = Math.floor(Math.random()*7);

        this.state = Math.floor(Math.random()*4);

        this.M = blockLib[this.type][this.state];
        this.position = [];
    }

    Block.prototype.rotate = function(){
    	var state = this.state;
    	var nstate = state + 1 > 3 ? 0 : state + 1;
    	var p = this.position;
        var om = blockLib[this.type][state];
        var nm = blockLib[this.type][nstate];
        var rel = [];
        for(var i = 0; i < p.length; i++){
        	rel.push([om[i][0] - nm[i][0], om[i][1] - nm[i][1]]);
        }
        var test = [];
        for(var i = 0; i < rel.length; i++){
        	test.push([p[i][0] - rel[i][0], p[i][1] - rel[i][1]]);        	
        }
        if(Game.validate(test)){
        	this.state = nstate;
        }
    }
    Block.prototype.move = function(){
        var operation = arguments[0],
            x = -operation[1],
            y = -operation[0];
        
        var test = [];
        for(var i = 0; i < 4;i++){
            test.push([this.position[i][0] - y, this.position[i][1] - x]);
        }

        return Game.validate(test);
    }

    Game.init();
	
	
	


})
