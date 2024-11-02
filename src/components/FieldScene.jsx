import "./FieldScene.css";
export const FieldScene = ({ field }) => {
    return (
        <div className="all">
            <div className="field">
                {field.map((y, yIndex) => {
                    return y.map((x, xIndex) => {
                        return (
                            <>
                                {x == 0 && <div className="kawa" key={`kawa-${xIndex}`} ></div>}
                                {x == 1 && <div className="syougai" key={`syougai-${xIndex}`} ></div>}
                                {x == 2 && <div className="score" key={`score-${xIndex}`} ></div>}
                                {x == 3 && <div className="muteki" key={`muteki-${xIndex}`} ></div>}
                                {x == 4 && <div className="player" key={`player-${xIndex}`} ></div>}
                            </>
                        )
                    })
                })}
            </div>
        </div>
    )
}