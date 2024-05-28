class Sphere{
    constructor(){
        this.type = 'sphere';
        this.color = [0,0,0,0];
        this.materialSmoothness =  .75; //specularExponent
        this.matrix = new Matrix4();
        this.textureNum = 0;
        const pie = Math.PI;
        this.vertices = [];
        this.UVs = [];
        this.indices = [];
        const vert = 20;
        const horiz = 20;
        for (let i = 0; i <= vert; i++){
            const V = i/vert;
            const phi = V * pie;
            for(let j = 0; j<= horiz; j++){
                const U = j/horiz;
                const theta = U * (pie * 2);
                this.vertices.push(Math.cos(theta) * Math.sin(phi)); // X
                this.vertices.push(Math.cos(phi)); // Y
                this.vertices.push(Math.sin(theta) * Math.sin(phi)); // Z
                this.UVs.push(U);
                this.UVs.push(V);
            }
        }
        for (let i = 0; i < vert; i++) {
            for (let j = 0; j < horiz; j++) {
                const first = (i * (horiz + 1)) + j;
                const second = first + horiz + 1;

                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }
        this.vertexNum = this.indices.length;
    }

    render(){       

        const rgba = this.color;
        gl.uniform1i(u_WhichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1f(u_MaterialSmoothness, this.materialSmoothness);

        // Vertex buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Normal buffer (same as vertex buffer)
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        // UV buffer
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.UVs), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        
        // Index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);

        gl.drawElements(gl.TRIANGLES, this.vertexNum, gl.UNSIGNED_SHORT, 0);
    }   

}
