


import React from "react";
import Pixel from "./Pixel";


import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2



const Row = ({ rowData, key, mapWidth,currentTile,tileHeight, tileWidth, selectedTile}) => {
   
   let pixels=[]
    for (let i=0; i<mapWidth; i++){
        pixels.push(<Pixel key={i}  currentTile={currentTile} tileHeight={tileHeight} tileWidth={tileWidth}></Pixel>)
    }

    return(
        <div className="row">{
            rowData.map((tile, index) =>{
                return <Pixel key={key + ' ' + index}  tileData = {tile} currentTile={currentTile} 
                tileHeight={tileHeight} tileWidth={tileWidth} selectedTile={selectedTile}></Pixel>
            })
        }</div>
    )
}

export default Row


