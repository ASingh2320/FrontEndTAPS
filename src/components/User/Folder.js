import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Waterfall from "../../static/waterfall.svg";
import FolderImage from "./icons_folder.png";
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import {useNavigate} from "react-router-dom"
import Checkbox from '@mui/material/Checkbox';
import StarBorder from '@mui/icons-material/StarBorder';
import Star from '@mui/icons-material/Star';
import TextField from '@mui/material/TextField';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FolderOpen } from '@mui/icons-material';

const Folder=({folderName, changeNameCallback, deleteCallback, folderId})=> {
  const [changingName, toggleNameChange] = React.useState(false);
  

  const navigate= useNavigate();
  const doneEditingName = (name) => {
    toggleNameChange(false);
    console.log(name);
    changeNameCallback(folderId, name);
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter'){
      doneEditingName(e.target.value);
    }
  }
  return (
    <Card sx={{ width:250  ,ml:3, mr:3, mt:1,boxShadow: "4px 4px 4px #F0EBCE" , }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          height="200"
          image={FolderImage}
          alt="map"
          onDoubleClick={()=>{
            navigate('/MapEditor');
          }}
        />
        <CardContent sx={{display:'flex',}}>
          
            <FolderOpen sx={{mt:1}}/>
            
            {changingName ? 
            <TextField sx={{fontSize:"1.3rem",mt:1,ml:1}} defaultValue={folderName} onBlur={(e) => doneEditingName(e.target.value)} 
            onKeyDown={handleKeyDown} variant="standard" /> : 
            <Typography noWrap gutterBotto sx={{fontSize:"1.0rem",mt:1,ml:1}}  component="div" 
            onDoubleClick={() => toggleNameChange(true)}>{folderName} </Typography>}

            
            <Checkbox  aria-label='Checkbox demo'
              icon={<StarBorder />} 
              checkedIcon={<Star  sx={{color:"#AA8B56"}}/>} 
              sx={{ boxShadow: 0.5 , ml:'auto'}}/>

            <Checkbox  aria-label='Checkbox demo'
              icon={<VisibilityOffIcon />} 
              checkedIcon={<VisibilityIcon/>} />

            <IconButton aria-label="delete" onClick={() => deleteCallback(folderId)}>
              <DeleteOutlinedIcon />
            </IconButton>
            
    
          
          
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Folder;