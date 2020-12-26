<div id="gdpr" aria-label="gdpr" class="notification" data-reactid="199"><span data-reactid="200"><!-- react-text: 201 -->By using this website, you agree to our <!-- /react-text --><a title="ConsenSys Privacy Policy" href="/design-system/privacy-policy" data-reactid="202" >cookie policy</a></span><a href="javascript:;" aria-controls="gdpr" data-reactid="203" class=""><svg width="10px" height="10px" viewBox="0 0 10 10" version="1.1" data-reactid="204">
  <title data-reactid="205">Combined Shape</title>
  <desc data-reactid="206">Created with Sketch.</desc>
  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" data-reactid="207">
    <g id="(Mobile)-Cookie-Policy" transform="translate(-350.000000, -704.000000)" fill="#242A30" fill-rule="nonzero" data-reactid="208">
      <path d="M355,707.585786 L358.292893,704.292893 C358.683418,703.902369 359.316582,703.902369 359.707107,704.292893 C360.097631,704.683418 360.097631,705.316582 359.707107,705.707107 L356.414214,709 L359.707107,712.292893 C360.097631,712.683418 360.097631,713.316582 359.707107,713.707107 C359.316582,714.097631 358.683418,714.097631 358.292893,713.707107 L355,710.414214 L351.707107,713.707107 C351.316582,714.097631 350.683418,714.097631 350.292893,713.707107 C349.902369,713.316582 349.902369,712.683418 350.292893,712.292893 L353.585786,709 L350.292893,705.707107 C349.902369,705.316582 349.902369,704.683418 350.292893,704.292893 C350.683418,703.902369 351.316582,703.902369 351.707107,704.292893 L355,707.585786 Z" id="Combined-Shape" data-reactid="209"></path>
    </g>
  </g>
</svg></a></div>

<a href="https://github.com/ConsenSys/rimble-ui" title="ConsenSystem Design System on GitHub" class="button is-primary" target="_blank" role="button" data-reactid="128">
<!-- react-text: 129 -->View on Github
<!-- /react-text -->
<!-- react-text: 130 -->
<!-- /react-text --><svg width="12px" height="10px" viewBox="0 0 12 10" version="1.1" data-reactid="131">
  <title data-reactid="132">Combined Shape</title>
  <desc data-reactid="133">Created with Sketch.</desc>
  <g id="Marketing-Pages" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" data-reactid="134">
    <g id="Design-System" transform="translate(-484.000000, -649.000000)" fill="#FFFFFF" fill-rule="nonzero" data-reactid="135">
      <g id="Group-3" transform="translate(170.000000, 118.000000)" data-reactid="136">
        <g id="Group" transform="translate(160.000000, 168.000000)" data-reactid="137">
          <g id="Button" transform="translate(0.000000, 348.000000)" data-reactid="138">
            <path d="M162.585786,19 L160.292893,16.7071068 C159.902369,16.3165825 159.902369,15.6834175 160.292893,15.2928932 C160.683418,14.9023689 161.316582,14.9023689 161.707107,15.2928932 L165.707107,19.2928932 C166.097631,19.6834175 166.097631,20.3165825 165.707107,20.7071068 L161.707107,24.7071068 C161.316582,25.0976311 160.683418,25.0976311 160.292893,24.7071068 C159.902369,24.3165825 159.902369,23.6834175 160.292893,23.2928932 L162.585786,21 L155,21 C154.447715,21 154,20.5522847 154,20 C154,19.4477153 154.447715,19 155,19 L162.585786,19 Z" id="Combined-Shape" data-reactid="139"></path>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg></a>

align-items: center;
background-color: #6141ed;
border: 1px solid transparent;
border-radius: 4px;
box-shadow: none;
color: #fff;
cursor: pointer;
display: inline-flex;
font-family: "Inter UI Medium","Helvetica Neue",Helvetica,Arial,sans-serif;
font-size: .875rem;
height: 2.25em;
justify-content: flex-start;
line-height: 1.5;
padding: calc(.375em - 1px) calc(.625em - 1px);
position: relative;
text-align: center;
text-decoration: none;
transition-duration: .15s;
transition-property: all;
transition-timing-function: ease;
vertical-align: top;
white-space: nowrap;

&:active {
background-color: #4e2aeb;
margin-bottom: 0;
margin-top: 0;
outline: none;
}

&:focus {
margin-bottom: 0;
margin-top: 0;
outline: none;
}

&:hover {
background-color: #5735ec;
box-shadow: rgba(0,0,0,.15) 0 2px 5px 0;
margin-bottom: 2px;
margin-top: -2px;
}

&:focus:not(:active) {
box-shadow: rgba(97,65,237,.25) 0 0 0 .125em;
}

<script>
export default {
  methods: {
    toggleDarkMode() {
      this.$inkline.config.variant = this.$inkline.config.variant === "light" ? "dark" : "light";
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    },
  },
};
</script>

<style lang="scss">

align-items: center;
background-color: #fff;
background-image: linear-gradient(-179deg,rgba(255,255,255,.9),#f2f4f7);
border-radius: 4px;
box-shadow: rgba(0,0,0,.1) 0 0 0 1px,rgba(0,0,0,.1) 0 1px 6px 0;
display: none;
justify-content: space-between;
padding: 1.25rem 2.5rem 1.25rem 1.5rem;
position: relative;
z-index: 111;

&:not(:last-child) {
  margin-bottom: 1.5rem;
}


</style>
