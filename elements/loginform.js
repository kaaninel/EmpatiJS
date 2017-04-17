const e = Elements;

_.Theme.AppendStyles({
  Form: {
    textAlign: "center",
    height: "60%",
    $_: {
      Mobile: {
        media: "only screen and (max-width: 768px)",
        paddingLeft: "5%",
        paddingTop: "60%",
        width: "90%"
      },
      Desktop: {
        media: "only screen and (min-width: 768px)",
        paddingLeft: "35%",
        paddingTop: "20%",
        width: "30%"
      }
    }
  }
});

const login_clicked = function(e){
  console.log(this);
  alert(this.Root.username + ' '+ this.Root.password);
}

return e.form({style: "Form"},
  e.input({placeholder:"Kullanıcı Adı", value: username => username, pattern:".{3,}"  }),
  e.input({placeholder:"Şifre", type:"password", value: password => password, pattern:".{6,}" }),
  e.button({value: "Giriş Yap", onclick: login_clicked})
);