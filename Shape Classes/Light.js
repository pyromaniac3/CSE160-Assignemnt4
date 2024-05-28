class Light{
    constructor(index){
        this.index = index;

        this.enabled = true;
        this.position = [1.0, 1.0, 1.0, 1.0]; // Default to a point light
        this.color = [1.0, 1.0, 1.0]; // White light
        this.direction = [0.0, -1.0, 0.0]; // Default direction for spotlight
        this.cutoff = 0; // Spotlight cutoff angle (30 degrees)
        //lu stands for Light Uniform
        this.lu_Enabled = gl.getUniformLocation(gl.program, `lights[${index}].enabled`);
        this.lu_Position = gl.getUniformLocation(gl.program, `lights[${index}].position`);
        this.lu_Color = gl.getUniformLocation(gl.program, `lights[${index}].color`);
        this.lu_Direction = gl.getUniformLocation(gl.program, `lights[${index}].direction`);
        this.lu_Cutoff = gl.getUniformLocation(gl.program, `lights[${index}].cutoff`);
    }

    render(){
        gl.uniform1i(this.lu_Enabled, this.enabled);
        gl.uniform4f(this.lu_Position, this.position[0], this.position[1], this.position[2], this.position[3]);
        gl.uniform3f(this.lu_Color, this.color[0],this.color[1],this.color[2]);
        gl.uniform3f(this.lu_Direction, this.direction[0], this.direction[1], this.direction[2]);
        gl.uniform1f(this.lu_Cutoff, this.cutoff);
    }
}