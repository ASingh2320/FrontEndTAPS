import React, { useState } from "react";
import { Grid} from "@mui/material";
import GrassIcon from '@mui/icons-material/Grass';
import "./mapEdit.css"
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grass from "../../static/grass.jpeg"
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import {Typography} from "@mui/material";
import { fontWeight } from "@mui/system";
import TS from "./samplets.png"
import SelectGrid from "./SelectGrid";

const Tiles=[Grass,Grass,Grass,Grass,Grass]
const itemData = [
    {
      img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
      title: 'Breakfast',
    },
    {
      img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
      title: 'Burger',
    },
    {
      img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
      title: 'Camera',
    },
    {
      img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
      title: 'Coffee',
    },
    {
      img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
      title: 'Hats',
    },
    {
      img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
      title: 'Honey',
    },
    {
      img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
      title: 'Basketball',
    },
    {
      img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
      title: 'Fern',
    },
    {
      img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
      title: 'Mushrooms',
    },
    {
      img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
      title: 'Tomato basil',
    },
    {
      img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
      title: 'Sea star',
    },
    {
      img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
      title: 'Bike',
    },
  ];
  
export default function TilesetMap(props) {
  const [openTS, toggleOpen] = React.useState(false);
  const [grid_points, setGridPoints] = React.useState([]);
  const [imageData, setImageData]= useState("");
  
 return (
    <>
    <Typography sx={{color:"white" ,backgroundColor:"#4E6C50" ,fontWeight:700, pl:2 ,pt:1,pb:1}}>Tilesets</Typography>
    {<SelectGrid select={props.select} tiles={props.tiles} gridPoints={grid_points}/>}
    {/*
    <ImageList sx={{ width: 239, height: 220 }} cols={3} rowHeight={45}>
      {itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
            srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            alt={item.title}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
    */}
    </>
    
 );
}








