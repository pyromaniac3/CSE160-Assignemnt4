class Cube{
    constructor(){
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
    }

    render(){
        var rgba = this.color;
        gl.uniform1i(u_WhichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix,false, this.matrix.elements);
        //vertices:
            //a (0,0,0),  b (1,0,0),  c (1,1,0),  d (0,1,0), 
            //e (0,0,-1), f (1,0,-1), g (1,1,-1), h (0,1,-1),
        drawTriangle3DUVNormals([0.0,0.0,0.0 , 1.0,1.0,0.0 , 1.0,0.0,0.0], [0,0, 1,1, 1,0], [0, 0, 1,  0, 0, 1,  0, 0, 1,]);
        drawTriangle3DUVNormals([0.0,0.0,0.0 , 0.0,1.0,0.0 , 1.0,1.0,0.0], [0,0, 0,1, 1,1], [0, 0, 1,  0, 0, 1,  0, 0, 1,]);

        drawTriangle3DUVNormals([0.0,0.0,-1.0 , 1.0,1.0,-1.0 , 1.0,0.0,-1.0], [0,0, 1,1, 1,0], [0, 0, -1,  0, 0, -1,  0, 0, -1,]);
        drawTriangle3DUVNormals([0.0,0.0,-1.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0], [0,0, 0,1, 1,1], [0, 0, -1,  0, 0, -1,  0, 0, -1,]);

        drawTriangle3DUVNormals([0.0,1.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0], [0,0, 1,1, 1,0], [0, 1, 0,  0, 1, 0,  0, 1, 0,]);
        drawTriangle3DUVNormals([0.0,1.0,0.0 , 0.0,1.0,-1.0 , 1.0,1.0,-1.0], [0,0, 0,1, 1,1], [0, 1, 0,  0, 1, 0,  0, 1, 0,]);

        drawTriangle3DUVNormals([0.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,0.0, 0.0], [0,0, 1,1, 1,0], [0, -1, 0,  0, -1, 0,  0, -1, 0,]);
        drawTriangle3DUVNormals([0.0,0.0,0.0 , 0.0,0.0,-1.0 , 1.0,0.0,-1.0], [0,0, 0,1, 1,1], [0, -1, 0,  0, -1, 0,  0, -1, 0,]);

        drawTriangle3DUVNormals([0.0,0.0,0.0 , 0.0,1.0,-1.0 , 0.0,1.0, 0.0], [0,0, 1,1, 1,0], [-1, 0, 0,  -1, 0, 0,  -1, 0, 0,]);
        drawTriangle3DUVNormals([0.0,0.0,0.0 , 0.0,0.0,-1.0 , 0.0,1.0,-1.0], [0,0, 0,1, 1,1], [-1, 0, 0,  -1, 0, 0,  -1, 0, 0,]);
        
        drawTriangle3DUVNormals([1.0,0.0,0.0 , 1.0,1.0,-1.0 , 1.0,1.0, 0.0], [0,0, 1,1, 1,0], [1, 0, 0,  1, 0, 0,  1, 0, 0,]);
        drawTriangle3DUVNormals([1.0,0.0,0.0 , 1.0,0.0,-1.0 , 1.0,1.0,-1.0], [0,0, 0,1, 1,1], [1, 0, 0,  1, 0, 0,  1, 0, 0]);
    }

}