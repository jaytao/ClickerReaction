import React from "react"

export default function Box(props) {
    const styles = {
        backgroundColor: props.on ? "#355E3B" : "transparent"
    }
    
    return (
        <div 
            style={styles} 
            className="box"
            onClick={()=>props.toggle(props.id)}
        >
        </div>
    )
}