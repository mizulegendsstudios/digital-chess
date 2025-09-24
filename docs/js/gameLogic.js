// js/gameLogic.js
class GameLogic {
    constructor(board, pieces) {
        this.board = board;
        this.pieces = pieces;
        this.boardSize = Config.BOARD_SIZE;
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentTurn = 'white';
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'playing'; // playing, check, checkmate, stalemate
        this.moveHistory = [];
        this.moveCount = 0;
    }
    
    isValidMoveWithoutCheckValidation(piece, toRow, toCol) {
        // Verificar si la posición está dentro del tablero
        if (toRow < 0 || toRow >= this.boardSize || toCol < 0 || toCol >= this.boardSize) {
            return false;
        }
        
        // Verificar si hay una pieza del mismo color en la posición destino
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }
        
        const rowDiff = toRow - piece.row;
        const colDiff = toCol - piece.col;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);
        
        switch(piece.type) {
            case 'pawn':
                // Los peones se mueven hacia adelante
                const direction = piece.color === 'white' ? -1 : 1;
                
                // Movimiento normal
                if (colDiff === 0 && rowDiff === direction && !targetPiece) {
                    return true;
                }
                
                // Primer movimiento (dos casillas)
                if (colDiff === 0 && rowDiff === 2 * direction && 
                    ((piece.color === 'white' && piece.row === 6) || 
                     (piece.color === 'black' && piece.row === 1)) &&
                    !this.board[piece.row + direction][piece.col] && !targetPiece) {
                    return true;
                }
                
                // Captura diagonal
                if (absColDiff === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
                    return true;
                }
                
                return false;
                
            case 'rook':
                // Las torres se mueven en línea recta
                if (rowDiff !== 0 && colDiff !== 0) {
                    return false;
                }
                
                // Verificar si hay piezas en el camino
                const rowStep = rowDiff === 0 ? 0 : rowDiff / absRowDiff;
                const colStep = colDiff === 0 ? 0 : colDiff / absColDiff;
                
                let checkRow = piece.row + rowStep;
                let checkCol = piece.col + colStep;
                
                while (checkRow !== toRow || checkCol !== toCol) {
                    if (this.board[checkRow][checkCol]) {
                        return false;
                    }
                    checkRow += rowStep;
                    checkCol += colStep;
                }
                
                return true;
                
            case 'knight':
                // Los caballos se mueven en L
                return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
                
            case 'bishop':
                // Los alfiles se mueven en diagonal
                if (absRowDiff !== absColDiff) {
                    return false;
                }
                
                // Verificar si hay piezas en el camino
                const rowStepB = rowDiff / absRowDiff;
                const colStepB = colDiff / absColDiff;
                
                let checkRowB = piece.row + rowStepB;
                let checkColB = piece.col + colStepB;
                
                while (checkRowB !== toRow || checkColB !== toCol) {
                    if (this.board[checkRowB][checkColB]) {
                        return false;
                    }
                    checkRowB += rowStepB;
                    checkColB += colStepB;
                }
                
                return true;
                
            case 'queen':
                // La reina se mueve como torre y alfil combinados
                if (rowDiff === 0 || colDiff === 0) {
                    // Movimiento de torre
                    const rowStepQ = rowDiff === 0 ? 0 : rowDiff / absRowDiff;
                    const colStepQ = colDiff === 0 ? 0 : colDiff / absColDiff;
                    
                    let checkRowQ = piece.row + rowStepQ;
                    let checkColQ = piece.col + colStepQ;
                    
                    while (checkRowQ !== toRow || checkColQ !== toCol) {
                        if (this.board[checkRowQ][checkColQ]) {
                            return false;
                        }
                        checkRowQ += rowStepQ;
                        checkColQ += colStepQ;
                    }
                    
                    return true;
                } else if (absRowDiff === absColDiff) {
                    // Movimiento de alfil
                    const rowStepQ = rowDiff / absRowDiff;
                    const colStepQ = colDiff / absColDiff;
                    
                    let checkRowQ = piece.row + rowStepQ;
                    let checkColQ = piece.col + colStepQ;
                    
                    while (checkRowQ !== toRow || checkColQ !== toCol) {
                        if (this.board[checkRowQ][checkColQ]) {
                            return false;
                        }
                        checkRowQ += rowStepQ;
                        checkColQ += colStepQ;
                    }
                    
                    return true;
                }
                
                return false;
                
            case 'king':
                // El rey se mueve una casilla en cualquier dirección
                return absRowDiff <= 1 && absColDiff <= 1;
                
            default:
                return false;
        }
    }
    
    isValidMove(piece, toRow, toCol) {
        // Verificar movimiento básico
        if (!this.isValidMoveWithoutCheckValidation(piece, toRow, toCol)) {
            return false;
        }
        
        // Simular el movimiento para verificar si deja al rey en jaque
        const originalRow = piece.row;
        const originalCol = piece.col;
        const capturedPiece = this.board[toRow][toCol];
        
        // Actualizar tablero temporalmente
        this.board[piece.row][piece.col] = null;
        this.board[toRow][toCol] = piece;
        piece.row = toRow;
        piece.col = toCol;
        
        // Verificar si el rey queda en jaque
        const inCheck = this.isKingInCheck(piece.color);
        
        // Revertir el movimiento
        piece.row = originalRow;
        piece.col = originalCol;
        this.board[originalRow][originalCol] = piece;
        this.board[toRow][toCol] = capturedPiece;
        
        // Si el rey queda en jaque, el movimiento no es válido
        return !inCheck;
    }
    
    isKingInCheck(color) {
        // Encontrar el rey del color dado
        const king = this.pieces.find(p => p.type === 'king' && p.color === color);
        if (!king) return false;
        
        // Verificar si alguna pieza del color opuesto puede capturar al rey
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (const piece of this.pieces) {
            if (piece.color === opponentColor) {
                if (this.isValidMoveWithoutCheckValidation(piece, king.row, king.col)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    getValidMoves(piece) {
        const moves = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidMove(piece, row, col)) {
                    moves.push({row, col});
                }
            }
        }
        
        return moves;
    }
    
    selectPiece(piece) {
        if (piece.color !== this.currentTurn) return false;
        
        this.selectedPiece = piece;
        this.validMoves = this.getValidMoves(piece);
        return true;
    }
    
    deselectPiece() {
        this.selectedPiece = null;
        this.validMoves = [];
    }
    
    makeMove(piece, toRow, toCol) {
        if (!this.isValidMove(piece, toRow, toCol)) {
            return false;
        }
        
        // Guardar las posiciones originales
        const originalCol = piece.col;
        const originalRow = piece.row;
        
        // Capturar pieza si existe
        const capturedPiece = this.board[toRow][toCol];
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece.type);
        }
        
        // Actualizar tablero
        this.board[piece.row][piece.col] = null;
        this.board[toRow][toCol] = piece;
        
        // Registrar movimiento
        this.moveCount++;
        const moveNotation = `${this.moveCount}. ${piece.type} ${String.fromCharCode(97 + originalCol)}${8 - originalRow} → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
        this.moveHistory.push(moveNotation);
        
        // Cambiar turno
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        
        // Verificar estado del juego
        this.checkGameStatus();
        
        return {
            pieceId: piece.id,
            fromRow: originalRow,
            fromCol: originalCol,
            toRow: toRow,
            toCol: toCol,
            nextTurn: this.currentTurn,
            moveCount: this.moveCount,
            moveNotation: moveNotation,
            capturedPiece: capturedPiece ? capturedPiece.id : null
        };
    }
    
    checkGameStatus() {
        // Verificar si el rey actual está en jaque
        const kingInCheck = this.isKingInCheck(this.currentTurn);
        
        // Verificar si hay movimientos legales
        let hasLegalMoves = false;
        for (const piece of this.pieces.filter(p => p.color === this.currentTurn)) {
            const moves = this.getValidMoves(piece);
            if (moves.length > 0) {
                hasLegalMoves = true;
                break;
            }
        }
        
        if (!hasLegalMoves) {
            if (kingInCheck) {
                this.gameStatus = 'checkmate';
            } else {
                this.gameStatus = 'stalemate';
            }
        } else if (kingInCheck) {
            this.gameStatus = 'check';
        } else {
            this.gameStatus = 'playing';
        }
    }
    
    restartGame() {
        // Reiniciar variables de juego
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentTurn = 'white';
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'playing';
        this.moveHistory = [];
        this.moveCount = 0;
    }
    
    serializeFullState() {
        return {
            board: this.board.map(row => row.map(c => c ? { 
                id: c.id, 
                type: c.type, 
                color: c.color, 
                row: c.row, 
                col: c.col 
            } : null)),
            pieces: this.pieces.map(p => ({ 
                id: p.id, 
                type: p.type, 
                color: p.color, 
                row: p.row, 
                col: p.col 
            })),
            currentTurn: this.currentTurn, 
            moveHistory: this.moveHistory, 
            moveCount: this.moveCount, 
            capturedPieces: this.capturedPieces, 
            gameStatus: this.gameStatus
        };
    }
    
    applyFullState(state) {
        // Reset estructuras
        this.pieces.length = 0;
        for (let r=0; r<this.boardSize; r++) { 
            for (let c=0; c<this.boardSize; c++) { 
                this.board[r][c] = null; 
            } 
        }
        
        // Reconstruir piezas
        state.pieces.forEach(sp => {
            const p = { 
                id: sp.id, 
                type: sp.type, 
                color: sp.color, 
                row: sp.row, 
                col: sp.col 
            };
            this.pieces.push(p); 
            this.board[sp.row][sp.col] = p;
        });
        
        this.currentTurn = state.currentTurn;
        this.moveHistory = state.moveHistory || [];
        this.moveCount = state.moveCount || 0;
        this.capturedPieces = state.capturedPieces || {white:[], black:[]};
        this.gameStatus = state.gameStatus || 'playing';
    }
}
