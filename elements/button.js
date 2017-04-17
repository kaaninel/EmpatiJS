_.Theme.AppendStyles({
  Button:{
    color: "white",
    fontFamily: "'Roboto', sans-serif",
    fontSize: "1em",
    border: "0",
    outline: "0",
    background: "Primary",
    lineHeight: "2em",
    marginTop: "6%",
    width: "100%",
    $_: {
      Disabled: {
        background: "Disabled",
        _: "[disabled]"
      }
    }
}});

return Elements.input({style: "Button",type: "button"});