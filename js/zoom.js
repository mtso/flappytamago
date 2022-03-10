(function () {
  window.onload = function () {
    const imgs = document.getElementsByClassName("image");

    for (let i = 0; i < imgs.length; i++) {
      if (imgs[i]) {
        addZoom(imgs[i]);
      }
    }

    function addZoom(el) {
      const onOpen = function (e) {
        const m = createModal();
        const onClose = function (e) {
          e.preventDefault();
          m.remove();
          m.removeEventListener("click", onClose);
          m.removeEventListener("touchend", onClose);
        };
        m.addEventListener("click", onClose);
        m.addEventListener("touchend", onClose);
      };
      el.addEventListener("click", onOpen);
      el.addEventListener("touchend", onOpen);
      el.style.cursor = "zoom-in";

      function createMargin(w) {
        const margin = document.createElement("div");
        margin.style.flexGrow = "1";
        margin.style.flexShrink = "0";
        margin.style.width = "1em";
        margin.style.height = "1em";
        return margin;
      }

      function createModal() {
        const cont = document.createElement("div");
        cont.style.width = "100%";
        cont.style.height = "100%";
        cont.style.position = "fixed";
        cont.style.top = "0";
        cont.style.left = "0";
        cont.style.backgroundColor = "rgba(0,0,0,0.5)";
        cont.style.display = "flex";

        const imgDiv = document.createElement("div");
        imgDiv.style.cursor = "zoom-out";

        const img = document.createElement("img");
        img.src = el.src;
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.position = "relative";

        imgDiv.appendChild(img);

        const imgDivCont = document.createElement("div");
        imgDivCont.style.display = "flex";
        imgDivCont.style.flexDirection = "column";
        imgDivCont.style.height = "100%";

        imgDivCont.appendChild(createMargin());
        imgDivCont.appendChild(imgDiv);
        imgDivCont.appendChild(createMargin());

        cont.appendChild(createMargin());
        cont.appendChild(imgDivCont);
        cont.appendChild(createMargin());

        cont.style.overflowY = "scroll";
        document.body.appendChild(cont);
        return cont;
      }
    }
  };
})();
