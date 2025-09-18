/*
Copyright (C) 2025 Deana Brcka
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <www.gnu.org/licenses/>.
*/

import {
    Instance
} from "cs_script/point_script";

Instance.OnActivate(() => {
    const maps = ["de_mirage", "de_nuke", "de_train"];
    const now = new Date();
    const hourOfDay = now.getHours();
    const mapName = maps[hourOfDay % maps.length];

    Instance.Msg(`Current map: ${mapName}`);
    Instance.ServerCommand(`map_workshop 3355497176 ${mapName}`);
});