{OVERALL_GAME_HEADER}

<div id="score">
    <div id="table-wrapper">
        <table>
            <thead>
                <tr id="scoretr"></tr>
            </thead>
            <tbody>
                <tr id="score-territories"></tr>
                <tr id="score-discover-tiles"></tr>
                <tr id="score-objective-tokens"></tr>
            </tbody>
            <tfoot>
                <tr id="scorefoot"></tr>
            </tfoot>
        </table>
    </div>
</div>

<div id="zoom-wrapper">
    <div id="full-table">
        <div id="scenario-name">
        </div>
            <div id="scroll-buttons">
                <div id="map-frame">
                    <div id="map">
                        <div id="dice" class="dices">
                            <div class="die">
                                <div id="d_die_1" class="dice white">
                                    <div id="c_die_1" class="cube">
                                        <div class="side side0">0</div>
                                        <div class="side side1">1</div>
                                        <div class="side side2">2</div>
                                        <div class="side side3">3</div>
                                        <div class="side side4">4</div>
                                        <div class="side side5">5</div>
                                    </div>
                                </div>
                            </div>
                            <div class="die">
                                <div id="d_die_2" class="dice black">
                                    <div id="c_die_2" class="cube">
                                        <div class="side side6">6</div>
                                        <div class="side side1">1</div>
                                        <div class="side side2">2</div>
                                        <div class="side side3">3</div>
                                        <div class="side side4">4</div>
                                        <div class="side side5">5</div>
                                    </div>
                                </div>
                            </div>
                        </div>	
                    </div>
                </div>
                <button class="scroll left" id="scroll-left"></button>
                <button class="scroll right" id="scroll-right"></button>
                <button class="scroll top" id="scroll-top"></button>
                <button class="scroll bottom" id="scroll-bottom"></button>
            </div>
        <div id="tables"></div>
        <div id="scenario-informations">
            <div id="scenario-synopsis"></div>
            <div id="scenario-special-rules"></div>
            <div id="scenario-objectives"></div>
        </div>
    </div>
    <div id="map-controls">
        <button class="bgabutton bgabutton_gray" id="display-map-scroll-100" data-display="scroll-100"></button>
        <button class="bgabutton bgabutton_gray" id="display-map-scroll-75" data-display="scroll-75"></button>
        <button class="bgabutton bgabutton_gray" id="display-map-scroll-50" data-display="scroll-50"></button>
        <button class="bgabutton bgabutton_gray" id="display-fit-map" data-display="fit-map-to-screen"></button>
        <button class="bgabutton bgabutton_gray" id="display-fit-map-and-board" data-display="fit-map-and-board-to-screen"></button>
        <button class="bgabutton bgabutton_gray" id="display-fit-map-and-board-bis" data-display="fit-map-and-board-to-screen-bis"></button>
    </div>
</div>

{OVERALL_GAME_FOOTER}