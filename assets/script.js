let data = false;
$(document).ready(function () {
    $(".cities-input").on("change keyup", function (event) {
        $(this).val($(this).val().split(' ').join(','));
    })

    $("button.get").on("click", async (e) => {
        data = getVal();
        callApi(data).done((data) => update(data)).fail(function (data) {
            console.log("🚀 ~ We could not find your request");
        })
    })
});

function getVal() {
    let val = $(".cities-input").val()
    val = val.split(/[ ,]+/).filter(function (v) { return v !== '' })
    return val.length > 0 ? val : false;
}
function callApi(data) {
    return $.post("http://localhost:7500/api/cities", { cities: data })
}
function update(data) {
    let cities = data.weather;
    let cards = []
    cities.forEach(city => {
        cards.push(card(city))
    });
    $('.card-columns').html(cards)

}
const card = (data) => {
    return`<div class="card">
    <div class="card-body">
        <h5 class="card-title">${data.city}</h5>
        <p class="card-text">Temprature : <span class="deg">${data.temp}</span></p>
    </div>
</div>`;
}