
_.Theme.AppendStyles({
  Input: {
    background: "transparent",
    lineHeight: "3em",
    width: "100%",
    color: "Color",
    fontFamily: "Font",
    fontSize: "FontSize",
    border: "0",
    outline: "0",
    borderBottom: "2px solid",
    borderBottomColor: "Primary",
    $_: {
      Placeholder: {
        color: "Color",
        opacity: 0.69,
        _: "::placeholder"
      },
      Valid: {
        borderBottomColor: "Primary",
        _: ":valid"
      },
      Invalid: {
        borderBottomColor: "Danger",
        _: ":invalid"
      },
      Autofill: {
        transition: "background-color 5000000s, color 5000000s",
        borderBottomColor: "Third",
        _: ":-webkit-autofill"
      }
    }
  }
});

return Elements.input({style: "Input", autocomplete: "off", trigger: ["change", "keyup"]});