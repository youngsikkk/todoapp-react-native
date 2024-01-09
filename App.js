import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert} from 'react-native';
import { theme } from './color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';

// TouchableOpacity: click event를 감지할 수 있는 버튼
// Opacity가 들어있는 이유는 애니메이션 효과가 있기 때문
// TouchableHighlight: 클릭했을 때 배경색이 바뀌도록 함
// TouchableWithoutFeedback: 애니메이션을 보여주고 싶지 않을 때 사용
// onPress: 유저가 Touchable을 눌렀을 때 실행되는 이벤트
// input, textarea가 아닌 TextInput 사용

export default function App() {

  const STORAGE_KEY = "@toDos";
  const [text, setText] = useState("");
  const [working, setWorking] = useState(true);
  const [toDos, setToDos] = useState({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(toSave));
  }
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) setToDos(JSON.parse(s));
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    loadToDos();
  },[])
  const addToDo = async() => {
    if (text === "") return;
    // react state의 불변성을 지키기 위해 사용, 얕은 복사
    // 전개연산자 ...을 사용해도 될 듯
    // const newToDos = Object.assign({}, toDos, {[Date.now()]:{text, work:working}});
    const newToDos =  {...toDos, [Date.now()]:{text, work:working}};
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }
  const deleteToDo = (key) => {
    Alert.alert("Delete to do?", "Are you sure you want to delete", [
      {text: "Cancel"},
      {text: "I'm Sure", onPress: async() => {
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }}
    ]);
    return
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white":theme.gray}}>Cheering</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white":theme.gray}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo} // 키패드의 확인버튼을 누를 시 작동
          placeholder={working ? "Add a To Do" : "Where do you want to go"}
          style={styles.input}
          onChangeText={onChangeText}
        />
      </View>
      <ScrollView>
         {
            Object.keys(toDos).map(key =>
              working === toDos[key].work ?
                (
                <View style={styles.toDo} key={key}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  <TouchableOpacity onPress={()=>deleteToDo(key)}>
                    <Fontisto name="trash" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                )
            : (
                <View key={key}></View>
              )
            )
         }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    marginTop: 100,
    paddingHorizontal: 20,
    justifyContent: 'space-between'

  },
  btnText: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: "white",
    paddingVertical:15,
    paddingHorizontal: 20,
    borderRadius:30,
    marginVertical: 20,
    fontSize: 18
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingHorizontal:20,
    paddingVertical:20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  toDoText: {
    color: '#FFF',
    fontSize:16,
    fontWeight: "500"
  }
});
