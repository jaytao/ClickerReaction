import React, { useState, useEffect } from "react";

export default function Box(props) {
  const [transientColor, setTransientColor] = useState("transparent");

  useEffect(() => {
    if (!props.on) {
      setTransientColor("lightgreen");
      setTimeout(() => {
        setTransientColor("transparent");
      }, 100);
    } else {
      setTransientColor("#355E3B");
    }
  }, [props.on]);

  const styles = {
    backgroundColor: props.on ? "#355E3B" : transientColor,
  };

  return (
    <div
      style={styles}
      className="box"
      onClick={() => props.toggle(props.id)}
    ></div>
  );
}
