
const Rules = {
    Primary: "#3F51B5",
    Secondary: "#FF5252",
    Third: "#2196F3",
    Disabled: "#333333",
    Background: "#232323",
    Font: "'Roboto', sans-serif",
    FontSize: "1em",
    Color: "white",
    Success: "#4CAF50",
    Danger: "#F44336",
    BoxShadow: "0 0 0 50px #232323 inset !important"
}

_.Theme.Rules = Rules;

_.Theme.AppendStyles({
  FullBleed: {
    position: "absolute",
    height: "100%",
    width: "100%",
    background: "Background",
    margin: 0
}});