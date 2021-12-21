let md;
md = window.markdownit({html: true}).use(window.markdownitFootnote);
let map, tileLayer;
map = L.map("beacons-map");
tileLayer = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
              attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://carto.com/attribution'>CARTO</a>",
              subdomains: "abcd",
              maxZoom: 18
            }).addTo(map);
map.setView([60, -15], 18);

let beaconsFeatures;
$.getJSON("beacons.geo.json", function(data){
  let beaconsLayer;
  beaconsFeatures = data.features.map(function(feature){
    return {
      name: feature.properties.name,
      html: feature.properties.html,
      tab: feature.properties.tab,
      mentions: feature.properties.mentions,
      lines: feature.properties.lines,
      wikipedia: feature.properties.wikipedia,
      latLng: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    };
  });
  if (document.location.href.match(/[^\/]+$/)[0].match(/be14/) !== null){
  beaconsLayer = L.featureGroup(beaconsFeatures.map(function(feature){
    let popupContent, lines;
  popupContent = "<h4>" + feature.name + "</h4>";
  if (feature.lines.length > 1){
    lines = "lines " + feature.lines.join(" and ");
  } else {
    lines = "line " + feature.lines[0];
  }
  popupContent = popupContent + "<p>" + feature.name + "is mentioned on " + lines + ".<br />";
  popupContent = popupContent + "Read about " + feature.name + " on <a href='"+ feature.wikipedia + "'>Wikipedia</a>.</p>";
    return L.circleMarker(feature.latLng, {
      color: "#ef700a"
    }).bindPopup (popupContent);
    })
  );
  }else{
    beaconsLayer=L.featureGroup(beaconsFeatures.map(function(feature){
      return L.circleMarker(feature.latLng, {color: "#ef700a"});
    })
  );
  }
  beaconsLayer.addTo(map);
  if (document.location.href.match(/[^\/]+$/)[0].match(/be12/) !== null){
    $.ajax({
      url: "IDA.md",
      success: function(markdown){
        let html;
        html = md.render(markdown);
        $("#content").html(html);
      }
    });
  }
  if (document.location.href.match(/[^\/]+$/)[0].match(/be13/) !== null){
    ["IDA",
    "LEMNOS", "ATHOS",
    "MACISTUS", "MESSAPION", "CITHAERON", "AEGYPLANCTUS", "ARACHNUS"].forEach(function(tab){
        // Create a variable tab that has the name as a string.
      $.ajax({
        url:  + tab + ".md",
        success: function(markdown){
          let html;
          html = md.render(markdown);
          $("#" + tab).html(html);
        }
      });
    });
  }
  if (document.location.href.match(/[^\/]+$/)[0].match(/be14/) !== null){
    $.ajax({
      url: "speech.md",
      success: function(markdown){
        let html;
        html = md.render(markdown);
        $("#speech").html(html);
        console.log(beaconsFeatures);
        console.log("it's in.");
        beaconsFeatures.forEach(function(feature){
          $("#speech").html(function(_, oldHtml){
            let regex, newHtml;
            regex = RegExp(feature.html, "g");
            newHtml = "<a href='#' data-tab='" +
              feature.tab + 
              "' data-lat='" +
              feature.latLng.lat +
              "' data-lng='" +
              feature.latLng.lng +
              "'>" + feature.html + "</a>";
            return oldHtml.replace(regex, newHtml);
          });
        });
        $("#speech a").click(function(){
          let tab, latLng;
          tab = $( this ).data("tab");
          $("#tabs-nav a[href='#" + tab + "']").tab("show");
          latLng = beaconsFeatures.filter(function(feature){
            return feature.tab === tab;
          })[0].latLng;
          map.panTo(latLng);
        });
      }
    });
    [ "IDA",
    "LEMNOS", "ATHOS",
    "MACISTUS", "MESSAPION", "CITHAERON", "AEGYPLANCTUS", "ARACHNUS"].forEach(function(tab){
      $.ajax({
        url:  + tab + ".md",
        success: function(markdown){
          let html;
          html = md.render(markdown);
          $("#" + tab).html(html);
        }
      });
    });
  }
  map.fitBounds(beaconsLayer.getBounds());
  map.zoomOut(.5);
});
