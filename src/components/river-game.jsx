import React, { useState, useEffect, useCallback } from 'react';

// 定数定義
const BLOCK_SIZE = 64;
const FIELD_WIDTH = 3;
const FIELD_HEIGHT = 12;
const BASE_SCORE = 10;
const ITEM_SCORE = 100;

// ブロックタイプに応じたスタイルを返す補助関数
const getBlockStyle = (blockType) => {
  switch (blockType) {
    case 1: // 障害物（岩）
      return 'bg-gray-600';
    case 2: // スコアアイテム（枝豆）
      return 'bg-green-400';
    case 3: // 無敵アイテム（こんにゃく）
      return 'bg-purple-400';
    default: // 川
      return 'bg-transparent';
  }
};

// メインゲームコンポーネント
const RiverGame = () => {
  const [fields, setFields] = useState([]);
  const [playerPosition, setPlayerPosition] = useState(1);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [isPoweredUp, setIsPoweredUp] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // フィールドデータの初期化
  useEffect(() => {
    // 実際のプロジェクトではここでAPIからフィールドデータを取得
    const mockFields = [
      [0, 0, 0], [0, 0, 0], [0, 0, 0],
      [3, 0, 1], [1, 0, 0], [0, 0, 2],
      [3, 0, 0], [0, 2, 0], [0, 0, 0],
      [1, 0, 3], [0, 0, 0], [2, 0, 0],
      [0, 0, 0]
    ];
    setFields(mockFields);
  }, []);

  // キーボード入力の処理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      switch (e.key) {
        case ' ':
          setIsGameRunning(prev => !prev);
          break;
        case 'ArrowLeft':
          if (isGameRunning) {
            setPlayerPosition(prev => Math.max(0, prev - 1));
          }
          break;
        case 'ArrowRight':
          if (isGameRunning) {
            setPlayerPosition(prev => Math.min(FIELD_WIDTH - 1, prev + 1));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameRunning, gameOver]);

  // 衝突時の処理
  const handleCollision = useCallback(() => {
    if (!isPoweredUp) {
      setIsGameRunning(false);
      setGameOver(true);
      // スコアをローカルストレージに保存
      localStorage.setItem('lastScore', score.toString());
      // ゲームオーバー画面へ遷移
    //   window.location.href = '/gameover';
    } else {
      setIsPoweredUp(false);
    }
  }, [isPoweredUp, score]);

  // アイテム取得時の処理
  const handleItemCollect = useCallback(() => {
    setScore(prev => prev + ITEM_SCORE);
  }, []);

  // パワーアップアイテム取得時の処理
  const handlePowerUpCollect = useCallback(() => {
    setIsPoweredUp(true);
  }, []);

  // スコアの自動加算
  useEffect(() => {
    if (!isGameRunning) return;

    const scoreInterval = setInterval(() => {
      setScore(prev => prev + BASE_SCORE);
    }, 1000);

    return () => clearInterval(scoreInterval);
  }, [isGameRunning]);

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      {/* スコア表示 */}
      <div className="mb-4 text-2xl font-bold">
        Score: {score.toString().padStart(8, '0')}
      </div>

      {/* ゲーム開始案内 */}
      {!isGameRunning && !gameOver && (
        <div className="mb-4 text-lg">
          Press SPACE to start/pause
        </div>
      )}

      {/* ゲームフィールド */}
      <GameField
        fields={fields}
        playerPosition={playerPosition}
        isGameRunning={isGameRunning}
        onCollision={handleCollision}
        onItemCollect={handleItemCollect}
        onPowerUpCollect={handlePowerUpCollect}
        isPoweredUp={isPoweredUp}
      />
    </div>
  );
};

// ゲームフィールドコンポーネント
const GameField = ({ 
  fields, 
  playerPosition, 
  isGameRunning, 
  onCollision, 
  onItemCollect, 
  onPowerUpCollect,
  isPoweredUp 
}) => {
  const [currentField, setCurrentField] = useState([]);
  const [offsetY, setOffsetY] = useState(0);
  const [speed, setSpeed] = useState(2);
  const [movedBlocks, setMovedBlocks] = useState(0);

  useEffect(() => {
    const initialField = fields.slice(0, FIELD_HEIGHT);
    setCurrentField(initialField);
  }, [fields]);

  const checkCollision = useCallback((fieldRow, playerPos) => {
    const blockType = fieldRow[playerPos];
    
    switch (blockType) {
      case 1: // 障害物
        onCollision();
        break;
      case 2: // スコアアイテム
        onItemCollect();
        // アイテムを消去
        fieldRow[playerPos] = 0;
        break;
      case 3: // 無敵アイテム
        onPowerUpCollect();
        // アイテムを消去
        fieldRow[playerPos] = 0;
        break;
    }
  }, [onCollision, onItemCollect, onPowerUpCollect]);

  useEffect(() => {
    if (!isGameRunning) return;

    const animate = () => {
      setOffsetY(prev => {
        const newOffset = prev + speed;
        
        if (newOffset >= BLOCK_SIZE) {
          setCurrentField(prevField => {
            const newField = [...prevField.slice(1)];
            const nextRowIndex = FIELD_HEIGHT + Math.floor(movedBlocks);
            
            if (fields[nextRowIndex]) {
              newField.push(fields[nextRowIndex]);
            } else {
              newField.push([0, 0, 0]);
            }
            
            checkCollision(newField[1], playerPosition);
            return newField;
          });

          setMovedBlocks(prev => {
            const newMovedBlocks = prev + 1;
            if (newMovedBlocks % 5 === 0) {
              setSpeed(prevSpeed => Math.min(prevSpeed + 0.5, 8));
            }
            return newMovedBlocks;
          });

          return 0;
        }
        return newOffset;
      });
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isGameRunning, speed, movedBlocks, fields, playerPosition, checkCollision]);

  return (
    <div className="relative w-[192px] h-[768px] bg-blue-200 overflow-hidden">
      <div 
        className="absolute w-full"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {currentField.map((row, rowIndex) => (
          <div key={`row-${rowIndex}-${movedBlocks}`} className="flex">
            {row.map((block, colIndex) => (
              <div
                key={`block-${rowIndex}-${colIndex}`}
                className={`w-16 h-16 ${getBlockStyle(block)}`}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* プレイヤー */}
      <div 
        className={`absolute w-16 h-16 transition-all duration-100 ${
          isPoweredUp ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{
          left: `${playerPosition * BLOCK_SIZE}px`,
          top: `${BLOCK_SIZE}px`
        }}
      />
    </div>
  );
};

// ゲームオーバー画面コンポーネント
const GameOver = () => {
  const [nickname, setNickname] = useState('');
  const [rankings, setRankings] = useState([]);
  const [isScorePosted, setIsScorePosted] = useState(false);
  const score = parseInt(localStorage.getItem('lastScore') || '0');

  // ランキング取得
  const fetchRankings = useCallback(async () => {
    try {
      // 実際のプロジェクトではAPIから取得
      const mockRankings = [
        { nickname: 'Player1', score: 1000 },
        { nickname: 'Player2', score: 800 },
        { nickname: 'Player3', score: 600 }
      ];
      setRankings(mockRankings);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    }
  }, []);

  // スコア投稿
  const handlePostScore = async () => {
    const inputNickname = window.prompt('Enter your nickname:');
    if (!inputNickname) return;

    try {
      // 実際のプロジェクトではAPIを呼び出し
      setIsScorePosted(true);
      setNickname(inputNickname);
      await fetchRankings();
      alert('Score posted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // ニックネーム更新
  const handleUpdateNickname = async () => {
    const newNickname = window.prompt('Enter new nickname:');
    if (!newNickname) return;

    try {
      // 実際のプロジェクトではAPIを呼び出し
      setNickname(newNickname);
      alert('Nickname updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // スコア削除
  const handleDeleteScore = async () => {
    if (!window.confirm('Are you sure you want to delete your score?')) return;

    try {
      // 実際のプロジェクトではAPIを呼び出し
      setIsScorePosted(false);
      alert('Score deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl mb-8">Game Over</h1>
      
      <div className="text-2xl mb-8">
        Score: {score.toString().padStart(8, '0')}
      </div>

      <div className="space-y-4 mb-8">
        {!isScorePosted ? (
          <button
            onClick={handlePostScore}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Post Score
          </button>
        ) : (
          <>
            <button
              onClick={handleUpdateNickname}
              className="px-4 py-2 bg-green-500 text-white rounded block"
            >
              Update Nickname
            </button>
            <button
              onClick={handleDeleteScore}
              className="px-4 py-2 bg-red-500 text-white rounded block"
            >
              Delete Score
            </button>
          </>
        )}
      </div>

      {rankings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Top 3 Rankings</h2>
          <div className="space-y-2">
            {rankings.map((rank, index) => (
              <div key={index} className="text-lg">
                {index + 1}. {rank.nickname}: {rank.score.toString().padStart(8, '0')}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Play Again
      </button>
    </div>
  );
};

export default RiverGame;
