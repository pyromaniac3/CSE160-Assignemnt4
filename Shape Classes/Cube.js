class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
        this.points = [0.0,0.0,0.0 , 1.0,1.0,0.0 , 1.0,0.0,0.0,
            0.0,0.0,0.0 , 0.0,1.0,0.0 , 1.0,1.0,0.0,
            0.0,0.0,-1.0 , 1.0,1.0,-1.0 , 1.0,0.0,-1.0,
            0.0,0.0,-1.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0,
            0.0,1.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0,
            0.0,1.0,0.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0,
            0.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,0.0, 0.0,
            0.0,0.0,0.0 , 0.0,0.0,-1.0 , 1.0,0.0,-1.0,
            0.0,0.0,0.0 , 0.0,1.0,-1.0 , 0.0,1.0, 0.0,
            0.0,0.0,0.0 , 0.0,0.0,-1.0 , 0.0,1.0,-1.0,
            1.0,0.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0,
            1.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,1.0,-1.0,
        ]

        this.UVS = [
            0,0, 1,1, 1,0, 0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, 0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, 0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, 0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, 0,0, 0,1, 1,1,
            0,0, 1,1, 1,0, 0,0, 0,1, 1,1, 
        ]

        this.normals = [
            0, 0, 1,  0, 0, 1,  0, 0, 1,
            0, 0, 1,  0, 0, 1,  0, 0, 1,
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            1, 0, 0,  1, 0, 0,  1, 0, 0,
            1, 0, 0,  1, 0, 0,  1, 0, 0
        ]
    }

    render(){
        var rgba = this.color;
        gl.uniform1i(u_WhichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix,false, this.matrix.elements);

        drawTriangle3DUVNormals(this.points, this.UVS, this.normals);
    }

}