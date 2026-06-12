/**
 * This file defines the initial data structure for face animation settings.
 * It includes global settings as well as a single keyframe with full configuration
 * for facial features: eyes, eyebrows, mouth, and tongue.
 */

paramsFace = {
    "Settings": {
        "TimeMax": 101,
        "TimeSpeed": 30,
        "Size": {
            "Width": 1024,
            "Height": 768,
        },
    },
   "Frames": {
        "0": {
            "IsKeyFrame": true,
            "Settings": {
              "BackgroundColor": "#F2E6CF",
              "Size": {
                "Width": 1000,
                "Height": 700
              }
            },
            "BrowLeft": {
              "Enabled": true,
              "Mirror": false,
              "TranslateX": -5,
              "TranslateY": 87,
              "ScaleX": 2.45,
              "ScaleY": 0.85,
              "Rotation": -2,
              "Curvature": 29,
              "Thickness": 11,
              "Length": 100,
              "ColorStroke": "#522700"
            },
            "BrowRight": {
              "Enabled": true,
              "TranslateX": 5,
              "TranslateY": 87,
              "ScaleX": 2.45,
              "ScaleY": 0.85,
              "Rotation": 2,
              "Curvature": 29,
              "Thickness": 11,
              "Length": 100,
              "ColorStroke": "#522700",
              "Mirror": true
            },
            "EyeLeft": {
              "Enabled": true,
              "Mirror": false,
              "Rotation": 0,
              "TranslateX": 25,
              "TranslateY": 0,
              "ScaleX": 1.2,
              "ScaleY": 0.45,
              "ColorFill": "#ffffff",
              "ColorStroke": "#000000",
              "StrokeWidth": 2.9,
              "GlobalCurvature": 13,
              "Curvature1": 13,
              "Curvature2": 10,
              "Curvature3": 12,
              "Curvature4": 20,
              "Roundness1": -3.1707317073170733,
              "Roundness2": -3.1707317073170733,
              "Roundness3": -3.1707317073170733,
              "Roundness4": -3.1707317073170733,
              "Iris": {
                "Enabled": true,
                "Mimic": false,
                "Rotation": 0,
                "TranslateX": 4,
                "TranslateY": 0.75,
                "ScaleX": 0.55,
                "ScaleY": 1.3,
                "ColorFill": "#9d6b15",
                "GlobalCurvature": 12,
                "Curvature1": 12,
                "Curvature2": 12,
                "Curvature3": 12,
                "Curvature4": 12,
                "Roundness1": -2.926829268292683,
                "Roundness2": -2.926829268292683,
                "Roundness3": -2.926829268292683,
                "Roundness4": -2.926829268292683
              }
            },
            "EyeRight": {
              "Enabled": true,
              "Rotation": 0,
              "TranslateX": 25,
              "TranslateY": 0,
              "ScaleX": 1.2,
              "ScaleY": 0.45,
              "ColorFill": "#ffffff",
              "ColorStroke": "#000000",
              "StrokeWidth": 2.9,
              "GlobalCurvature": 13,
              "Curvature1": 13,
              "Curvature2": 18,
              "Curvature3": 12,
              "Curvature4": 9,
              "Roundness1": -3.1707317073170733,
              "Roundness2": -3.1707317073170733,
              "Roundness3": -3.1707317073170733,
              "Roundness4": -3.1707317073170733,
              "Iris": {
                "Enabled": true,
                "Mimic": false,
                "Rotation": 0,
                "TranslateX": -4,
                "TranslateY": 0.75,
                "ScaleX": 0.55,
                "ScaleY": 1.3,
                "ColorFill": "#9d6b15",
                "GlobalCurvature": 12,
                "Curvature1": 12,
                "Curvature2": 12,
                "Curvature3": 12,
                "Curvature4": 12,
                "Roundness1": -2.926829268292683,
                "Roundness2": -2.926829268292683,
                "Roundness3": -2.926829268292683,
                "Roundness4": -2.926829268292683
              }
            },
            "Mouth": {
              "Enabled": true,
              "Shape": "rectangle",
              "Rotation": 0,
              "TranslateX": 0,
              "TranslateY": 47,
              "ScaleX": 3.15,
              "ScaleY": 0.5,
              "ColorFill": "#f56666",
              "ColorStroke": "#000000",
              "StrokeWidth": 1,
              "GlobalCurvature": 10,
              "Curvature1": -50,
              "Curvature2": -1,
              "Curvature3": 50,
              "Curvature4": 0,
              "Roundness1": -2.439024390243902,
              "Roundness2": -2.439024390243902,
              "Roundness3": -2.439024390243902,
              "Roundness4": -2.439024390243902,
              "Tongue": {
                "Enabled": true,
                "Mimic": false,
                "TranslateX": -0.6486587524414062,
                "TranslateY": 86,
                "ScaleX": 2.05,
                "ScaleY": 0.65,
                "Rotation": 0,
                "GlobalCurvature": 0,
                "Curvature1": 2,
                "Curvature2": 8.864864864864865,
                "Curvature3": 13.243243243243244,
                "Curvature4": 8,
                "Roundness1": -2.439024390243902,
                "Roundness2": -2.439024390243902,
                "Roundness3": -2.439024390243902,
                "Roundness4": -2.439024390243902,
                "ColorFill": "#a54545"
              }
            }
          }
    }   
}