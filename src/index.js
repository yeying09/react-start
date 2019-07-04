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
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
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
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice(); 
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        // 不可变性：immutable，
        // 使用新数据替换旧数据 -> 撤销和恢复; 跟踪数据改变; 在React中创建pure components，确定何时重新渲染shouldComponentUpdate()
        squares[i] = this.state.xIsNext? 'X': 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                position: {
                    x: i % 3,
                    y: Math.floor(i / 3)
                },
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'go to move #' + move + '(' + step.position.x + ',' + step.position.y + ')':
                'go to start';

            if(move === this.state.stepNumber) {
                return (
                    <li key={move}>
                        <button 
                            style={{fontWeight: 'bold'}} 
                            onClick={() => this.jumpTo(move)}
                        >{desc}</button>
                    </li>
                );
            } else {
                return (
                    <li key={move}>
                        <button onClick={() => this.jumpTo(move)}>{desc}</button>
                    </li>
                )
            }
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
                    <div>{status}</div>
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