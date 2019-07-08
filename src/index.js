import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button 
            className="square" 
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square 
                value={this.props.squares[i]} 
                onClick={() => this.props.onClick(i)}
                key={i}
            />
        );
    }

    render() {
        let arrays = [0, 1, 2];

        return (
            <div>
                {
                    arrays.map((item, index) => {
                        return (
                            <div className="board-row" key={item}>
                                {
                                    arrays.map((subitem, subindex) => {
                                        return (this.renderSquare(3*index + subindex))
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                position: { 
                    x: null, // 列号
                    y: null, // 行号
                },
            }],
            stepNumber: 0,
            xIsNext: true,
            historySort: 0, // 默认升序：0-升序 1-降序
        }
    }

    handleClick(i) {
        const history = this.state.historySort === 0? this.state.history.slice(0, this.state.stepNumber + 1): this.state.history.slice(this.state.stepNumber);
        const current = this.state.historySort === 0? history[history.length - 1]: history[0];
        const squares = current.squares.slice(); 
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        // 不可变性：immutable，
        // 使用新数据替换旧数据 -> 撤销和恢复; 跟踪数据改变; 在React中创建pure components，确定何时重新渲染shouldComponentUpdate()
        squares[i] = this.state.xIsNext? 'X': 'O';
        this.setState({
            history: this.state.historySort === 0? 
                history.concat([{
                    squares: squares,
                    position: {
                        x: i % 3,
                        y: Math.floor(i / 3)
                    },
                }]): [{
                    squares: squares,
                    position: {
                        x: i % 3,
                        y: Math.floor(i / 3)
                    },
                }].concat(history),
            stepNumber: this.state.historySort === 0? history.length: 0,
            xIsNext: !this.state.xIsNext,
        });
    }

    /**
     * update: is X the next player
     * @return true / false
     */
    changePlayer(step, sort) {
        const historyLength = this.state.history.length;
        let flag = true;
        if (sort === 0) {
            flag = (step % 2) === 0
        } else if (sort === 1) {
            flag = (historyLength - 1 - step) % 2 === 0
        }
        return flag;
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: this.changePlayer(step, this.state.historySort)
        })
    }

    changeHistorySort() {
        let history = [...this.state.history];
        history = history.reverse();
        this.setState({
            historySort: this.state.historySort? 0: 1, // change sort
            history: history, // reverse array
            xIsNext: this.changePlayer(this.state.stepNumber, this.state.historySort? 0: 1)
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            let desc = (this.state.historySort === 0 && move) || (this.state.historySort === 1 && move < history.length-1) ?
                    'go to move #' + move + '(' + step.position.x + ',' + step.position.y + ')':
                    'go to start';
            
            
            return (
                <li key={move}>
                    {
                        <button 
                            className={"a"+(move === this.state.stepNumber?"1":"0")}
                            style={move === this.state.stepNumber?{fontWeight: 'bold'}:{}} 
                            onClick={() => this.jumpTo(move)}
                        >{desc}</button>
                    }
                    
                </li>
            )
        });

        let status;
        if(winner) {
            status = 'Winner: ' + winner;
        } else {
            if(history.length === current.squares.length + 1 
                && this.state.stepNumber === current.squares.length) { // 没有决出胜负->判断是否走完九步
                status = '-- Draw --';
            } else {
                status = 'Next player: ' + (this.state.xIsNext? 'X': 'O');
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status} 
                        <button 
                            onClick={() => this.changeHistorySort()}
                        >
                            {this.state.historySort? 'Desc': 'Asc'}
                        </button>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        )
    }
}

//============================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
)

/***
 * 判断胜负的helper函数
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}