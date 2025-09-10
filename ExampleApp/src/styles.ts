import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 16,
    },
    callContainer: {
        paddingHorizontal: 16,
    },
    welcome: {
        fontSize: 30,
        textAlign: "center",
        paddingTop: 40,
    },
    input: {
        minHeight: 90,
        maxHeight: 160,
        borderWidth: 1,
        borderColor: "#D0D5DD",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 24,
        textAlignVertical: "top",
        backgroundColor: "#FAFAFA",
        fontSize: 13,
    },
    button: {
        marginTop: 50,
        backgroundColor: "lightblue",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        height: 50,
        alignSelf: "center",
    },
    localVideo: {
        width: 120,
        height: 180,
        borderRadius: 12,
        alignSelf: "flex-end",
    },
    remoteGrid: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    remoteVideo: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        width: 100,
        height: 120,
    },
    optionsContainer: {
        flexDirection: "row",
        padding: 14,
        gap: 8,
        flexWrap: "wrap",
        backgroundColor: "rgba(145, 132, 132, 0.9)",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 4,
    },
    optionButton: {
        padding: 15,
        borderRadius: 16,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
    },

    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    headerContainer: {
        padding: 20,
        alignItems: "center",
    },

    connectedWrapper: {
        flex: 1,
        justifyContent: "space-between",
    },

    logPanel: {
        height: 120,
        width: "100%",
        backgroundColor: "#111",
        marginTop: 4,
    },

    logText: {
        fontSize: 10,
        color: "#ccc",
    },
});
